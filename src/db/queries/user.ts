import { db } from '../db'
import {
  accessLevelMapTable,
  userProfileTable,
  userTable,
  userView
} from '../schema/user'
import { eq, sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'astro:schema'

// schemas & types

export const createUserInputSchema = z
  .object({})
  .merge(
    createInsertSchema(userTable, {
      userName: (s) =>
        s.min(4, 'Username minimal sepanjang 4 karakter atau lebih.')
    })
  )
  .merge(createInsertSchema(userProfileTable))
  .omit({ id: true, userId: true })

type CreateUserInput = z.infer<typeof createUserInputSchema>

// queries

export const getAllUsers = async () => {
  const getAllUsersSQL = db.select().from(userView).prepare()

  return await getAllUsersSQL.execute()
}

export const getUserByUserName = async (userName: string) => {
  const getUserByUserNameSQL = db
    .select()
    .from(userView)
    .where(eq(userView.userName, userName))
    .limit(1)
    .prepare()

  const [user] = await getUserByUserNameSQL.execute()
  return user
}

export const getCoreUser = async (userName: string) => {
  const getCoreUserSQL = db
    .select({
      id: userTable.id,
      passwordHash: userTable.passwordHash
    })
    .from(userTable)
    .where(eq(userTable.userName, userName))
    .limit(1)
    .prepare()

  const [user] = await getCoreUserSQL.execute()
  return user
}

export const getAccessLevels = async () => {
  const getAccessLevelsSQL = db.select().from(accessLevelMapTable).prepare()

  return await getAccessLevelsSQL.execute()
}

export const createUser = async (
  input: CreateUserInput,
  existingUser: User = undefined
) => {
  const {
    userName,
    accessLevel,
    passwordHash,
    fullName,
    phoneNumber,
    profilePhoto
  } = input

  await db.transaction(async (tx) => {
    const inputUserSQL = tx
      .insert(userTable)
      .values({ userName, accessLevel, passwordHash })
      .onDuplicateKeyUpdate({ set: { accessLevel, passwordHash } })
      .$returningId()
      .prepare()
    const inputUserProfileSQL = tx
      .insert(userProfileTable)
      .values({
        userId: sql.placeholder('userId'),
        fullName,
        phoneNumber,
        profilePhoto
      })
      .onDuplicateKeyUpdate({ set: { fullName, phoneNumber, profilePhoto } })
      .prepare()

    let userId: string | undefined
    if (existingUser) {
      userId = existingUser.userId
    } else {
      const [newUser] = await inputUserSQL.execute()
      if (!newUser) {
        tx.rollback()
        throw new Error('Ada masalah dalam menambahkan user.')
      }
      userId = newUser.id
    }

    await inputUserProfileSQL.execute({ userId })
  })

  return await getUserByUserName(userName)
}

type User = Awaited<ReturnType<typeof getUserByUserName>>
