import { db } from '~/db/db'
import { sessionTable, userTable } from '~/db/schema/user'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { eq, sql } from 'drizzle-orm'

export const generateSessionToken = () => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

export const createSessionId = (token: string) =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

export const createSession = async (token: string, userId: string) => {
  const sessionId = createSessionId(token)

  return await db.transaction(async (tx) => {
    await insertSessionSQL.execute({ sessionId, userId })
    const [freshSession] = await getSessionSQL.execute({ sessionId })
    if (!freshSession) {
      tx.rollback()
      throw new Error('Ada masalah di server kami.')
    }

    return freshSession
  })
}

export const validateSessionToken = async (token: string) => {
  const sessionId = createSessionId(token)
  const emptySession = {
    user: undefined,
    session: undefined
  }

  const [validatedSession] = await getSessionJoinUserSQL.execute({ sessionId })
  if (!validatedSession) {
    return emptySession
  }

  const { session } = validatedSession

  if (Date.now() > session.expiresAt.getTime()) {
    await deleteSessionSQL.execute({ sessionId: session.id })
    return emptySession
  }

  if (Date.now() > session.expiresAt.getTime() - 1000 * 60 * 60 * 24) {
    return await db.transaction(async (tx) => {
      await updateSessionSQL.execute({ sessionId: session.id })
      const [freshSession] = await getSessionJoinUserSQL.execute({ sessionId })
      if (!freshSession) {
        tx.rollback()
        return emptySession
      }

      return freshSession
    })
  }

  return validatedSession
}

export const invalidateSession = async (sessionId: string) => {
  await deleteSessionSQL.execute({ sessionId })
}

export const invalidateAllSession = async (userId: string) => {
  await deleteSessionByUserSQL.execute({ userId })
}

// prepared SQLs
const insertSessionSQL = db
  .insert(sessionTable)
  .values({
    id: sql.placeholder('sessionId'),
    userId: sql.placeholder('userId'),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  })
  .prepare()

const getSessionSQL = db
  .select()
  .from(sessionTable)
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const getSessionJoinUserSQL = db
  .select({
    user: {
      id: userTable.id,
      userName: userTable.userName,
      accessLevel: userTable.accessLevel
    },
    session: sessionTable
  })
  .from(sessionTable)
  .innerJoin(userTable, eq(userTable.id, sessionTable.userId))
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const updateSessionSQL = db
  .update(sessionTable)
  .set({
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  })
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const deleteSessionSQL = db
  .delete(sessionTable)
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const deleteSessionByUserSQL = db
  .delete(sessionTable)
  .where(eq(sessionTable.userId, sql.placeholder('userId')))
  .prepare()

// types

export type UserSession = Awaited<ReturnType<typeof validateSessionToken>>
