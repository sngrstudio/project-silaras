import { db } from '../db'
import { user, session } from '../schemas/user'
import { region } from '../schemas/region'
import { eq, sql, getTableColumns, lt, gte } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/**
 * User table query functions.
 */

/**
 * Check if any Super Administrators exist in the system.
 * @returns Promise<boolean> - true if no Super Administrators exist, false otherwise
 */
export const isNoSuperAdmin = async (): Promise<boolean> => {
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(gte(user.accessLevel, 5)) // Check for Super Administrators (level 5 and above)
    .then((rows) => rows[0]?.count ?? 0)

  return adminCount === 0
}

/**
 * Insert or update a user (upsert).
 * If a user with the same id exists, it will be updated.
 * @param data User data (username, accessLevel, passwordHash, fullName, phoneNumber?, profilePhoto?, regionId, id?)
 * @returns The newly created or updated user object
 */
export const upsertUser = async (data: {
  username: string
  accessLevel: number
  passwordHash: string | null
  fullName: string
  phoneNumber?: string | null
  profilePhoto?: string | null
  regionId?: string | null
  id?: string
}) => {
  const id = data.id ?? randomUUID()
  await db
    .insert(user)
    .values({
      ...data,
      id,
      phoneNumber: data.phoneNumber ?? undefined,
      profilePhoto: data.profilePhoto ?? undefined
    })
    .onDuplicateKeyUpdate({
      set: {
        username: data.username,
        accessLevel: data.accessLevel,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber ?? undefined,
        profilePhoto: data.profilePhoto, // Don't convert null to undefined - we want to explicitly set null
        regionId: data.regionId ?? undefined
      }
    })
  return await getUserById(id)
}

/**
 * Get a user by their id.
 * @param id User id
 * @returns User object (without password hash) or undefined if not found
 */
export const getUserById = async (id: string) => {
  return db
    .select({
      id: user.id,
      username: user.username,
      accessLevel: user.accessLevel,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      regionId: user.regionId
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a user by their username (safe - excludes password hash).
 * @param username Username to look up
 * @returns User object (without password hash) or undefined if not found
 */
export const getUserByUsername = async (username: string) => {
  return db
    .select({
      id: user.id,
      username: user.username,
      accessLevel: user.accessLevel,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      regionId: user.regionId
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a user by their username for authentication purposes (includes password hash).
 * This function should only be used for authentication operations.
 * @param username Username to look up
 * @returns User object (with password hash) or undefined if not found
 */
export const getUserByUsernameForAuth = async (username: string) => {
  return db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a user by their phone number (safe - excludes password hash).
 * @param phoneNumber Phone number to look up
 * @returns User object (without password hash) or undefined if not found
 */
export const getUserByPhoneNumber = async (phoneNumber: string) => {
  return db
    .select({
      id: user.id,
      username: user.username,
      accessLevel: user.accessLevel,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      regionId: user.regionId
    })
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a user's password hash by their ID.
 * This function should only be used when specifically needed for password operations.
 * @param id User id
 * @returns Password hash or undefined if not found
 */
export const getUserPasswordHashById = async (
  id: string
): Promise<string | undefined> => {
  const result = await db
    .select({
      passwordHash: user.passwordHash
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)

  return result?.passwordHash ?? undefined
}

/**
 * Get a paginated list of users (safe - excludes password hash).
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @returns Object with users array and total count for pagination
 */
export const getAllUsers = async (page: number = 1, size: number = 10) => {
  const offset = (page - 1) * size

  const mainQuery = db
    .select({
      ...getTableColumns(user),
      regionName: region.name,
      regionType: region.type,
      regionSlug: region.slug,
      regionParentId: region.parentId,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount')
    })
    .from(user)
    .leftJoin(region, eq(user.regionId, region.id))
    .where(lt(user.accessLevel, 5)) // Hide Super Administrators (level 5)
    .limit(size)
    .offset(offset)

  const results = await mainQuery

  return {
    users: results.map(({ totalCount, passwordHash, ...user }) => user),
    totalCount: results[0]?.totalCount ?? 0
  }
}

/**
 * Delete a user by id.
 * @param id User id
 * @returns void
 */
export const deleteUser = async (id: string): Promise<void> => {
  await db.delete(user).where(eq(user.id, id))
}

/**
 * Session table query functions.
 */

/**
 * Insert or update a session (upsert).
 * If a session with the same id exists, it will be updated.
 * @param data Session data (id, userId, expiresAt)
 * @returns The newly created or updated session object
 */
export const upsertSession = async (data: {
  id: string
  userId: string
  expiresAt: Date
}) => {
  await db
    .insert(session)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        userId: data.userId,
        expiresAt: data.expiresAt
      }
    })
  return await getSessionById(data.id)
}

/**
 * Get a session by its id, including the associated user data.
 * @param id Session id
 * @returns Object containing session and user data, or null if not found
 */
export const getSessionById = async (id: string) => {
  const result = await db
    .select({
      session: session,
      user: {
        id: user.id,
        username: user.username,
        accessLevel: user.accessLevel,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        regionId: user.regionId
      }
    })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(eq(session.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)

  if (!result)
    return {
      session: undefined,
      user: undefined
    }
  return {
    session: result.session,
    user: result.user
  }
}

/**
 * Delete a session by its id.
 * @param id Session id
 * @returns void
 */
export const deleteSessionById = async (id: string): Promise<void> => {
  await db.delete(session).where(eq(session.id, id))
}

/**
 * Delete all sessions for a given user id.
 * @param userId User id
 * @returns void
 */
export const deleteSessionsByUserId = async (userId: string): Promise<void> => {
  await db.delete(session).where(eq(session.userId, userId))
}

/**
 * Search users by username, full name, or phone number (safe - excludes password hash).
 * @param searchTerm Search term to match against username, full name, or phone number
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @returns Object with users array and total count for pagination
 */
export const searchUsers = async (
  searchTerm: string,
  page: number = 1,
  size: number = 10
) => {
  const offset = (page - 1) * size
  const searchPattern = `%${searchTerm}%`

  const mainQuery = db
    .select({
      ...getTableColumns(user),
      regionName: region.name,
      regionType: region.type,
      regionSlug: region.slug,
      regionParentId: region.parentId,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount')
    })
    .from(user)
    .leftJoin(region, eq(user.regionId, region.id))
    .where(
      sql`${user.accessLevel} < 5 AND (${user.username} LIKE ${searchPattern} OR ${user.fullName} LIKE ${searchPattern} OR ${user.phoneNumber} LIKE ${searchPattern})`
    )
    .limit(size)
    .offset(offset)

  const results = await mainQuery

  return {
    users: results.map(({ totalCount, passwordHash, ...user }) => user),
    totalCount: results[0]?.totalCount ?? 0
  }
}
