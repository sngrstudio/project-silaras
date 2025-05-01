import { db } from '../db'
import { userTable, sessionTable } from '../schema/auth'
import { eq, sql } from 'drizzle-orm'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

export const generateSessionToken = () => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

export const createSession = async ({
  token,
  userId
}: {
  token: string
  userId: string
}) => {
  const sessionId = encodeToken(token)
  const session = await db.transaction(async (tx) => {
    await tx.insert(sessionTable).values({
      userId,
      id: sessionId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    })

    const [sessionFromDb] = await tx
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, sessionId))
    if (!sessionFromDb) {
      tx.rollback()
      throw new Error('Session (probably) not saved successfully.')
    }

    return sessionFromDb
  })

  return session
}

export const validateSessionToken = async ({ token }: { token: string }) => {
  const sessionId = encodeToken(token)
  const getSessionData = db
    .select({
      user: { id: userTable.id, userName: userTable.userName },
      session: sessionTable
    })
    .from(sessionTable)
    .innerJoin(userTable, eq(userTable.id, sessionTable.userId))
    .where(eq(sessionTable.id, sql.placeholder('sessionId')))
    .prepare()

  const [sessionData] = await getSessionData.execute({ sessionId })

  if (!sessionData) return { user: null, session: null }

  if (Date.now() >= sessionData.session.expiresAt.getTime()) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, sessionData.session.id))
    return { user: null, session: null }
  }

  if (
    Date.now() >=
    sessionData.session.expiresAt.getTime() + 1000 * 60 * 60 * 12
  ) {
    const newSessionData = await db.transaction(async (tx) => {
      await tx
        .update(sessionTable)
        .set({ expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) })
        .where(eq(sessionTable.id, sessionData.session.id))

      const [newSessionDataFromDb] = await getSessionData.execute({
        sessionId: sessionData.session.id
      })
      if (!newSessionDataFromDb) {
        tx.rollback()
        return { user: null, session: null }
      }

      return newSessionDataFromDb
    })

    return newSessionData
  }

  return sessionData
}

export const invalidateSession = async ({
  sessionId
}: {
  sessionId: string
}) => {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export const invalidateAllSession = async ({ userId }: { userId: string }) => {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId))
}

// Password-related tool
export const hashPassword = async ({ password }: { password: string }) =>
  await Bun.password.hash(password)

export const verifyPassword = async ({
  password,
  hash
}: {
  password: string
  hash: string
}) => await Bun.password.verify(password, hash)

// types
export type ValidatedSessionToken = Awaited<
  ReturnType<typeof validateSessionToken>
>

// helpers
const encodeToken = (token: string) =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
