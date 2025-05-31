import { db } from '../db'
import { user, session } from '../schemas/user'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/**
 * User table query functions.
 */

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
        profilePhoto: data.profilePhoto ?? undefined,
        regionId: data.regionId ?? undefined
      }
    })
  return await getUserById(id)
}

/**
 * Get a user by their id.
 * @param id User id
 * @returns User object or null if not found
 */
export const getUserById = async (id: string) => {
  return db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a user by their username.
 * @param username Username to look up
 * @returns User object or null if not found
 */
export const getUserByUsername = async (username: string) => {
  return db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1)
    .then((rows) => rows[0] ?? undefined)
}

/**
 * Get a paginated list of users.
 * @param page Page number (1-based, defaults to 1)
 * @param size Page size (defaults to 10)
 * @returns Array of users for the page
 */
export const getAllUsers = async (page: number = 1, size: number = 10) => {
  const offset = (page - 1) * size
  return db.select().from(user).limit(size).offset(offset)
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
      user: user
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
