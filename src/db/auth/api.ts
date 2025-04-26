import { db } from '..'
import { sessionTable, userTable } from '../schema/user'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { eq } from 'drizzle-orm'

export const generateSessionToken = () => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

export const createSession = async (token: string, userId: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = await db.transaction(async (tx) => {
    await tx.insert(sessionTable).values({
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    })

    const [sessionFromDb] = await tx
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, sessionId))

    if (!sessionFromDb) {
      throw (
        (new Error('There is a problem when saving sessions to DB'),
        tx.rollback())
      )
    }

    return sessionFromDb
  })

  return session
}

export const validateSessionToken = async (token: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const validationResult = await db.transaction(async (tx) => {
    const emptySession = { user: null, session: null }

    const [res] = await tx
      .select({ user: userTable, session: sessionTable })
      .from(sessionTable)
      .innerJoin(userTable, eq(userTable.id, sessionTable.userId))
      .where(eq(sessionTable.userId, sessionId))

    if (!res) return emptySession

    const { user, session } = res
    if (Date.now() > session.expiresAt.getTime()) {
      await tx.delete(sessionTable).where(eq(sessionTable.id, sessionId))
      return emptySession
    }

    if (Date.now() >= session.expiresAt.getTime() + 1000 * 60 * 60 * 6) {
      await tx
        .update(sessionTable)
        .set({ expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) })
        .where(eq(sessionTable.id, sessionId))
      const [newSession] = await tx
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.id, sessionId))

      if (!newSession) return emptySession

      return { user, session: newSession }
    }

    return { user, session }
  })

  return validationResult
}

export const invalidateSession = async (sessionId: string) => {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export const invalidateAllSession = async (userId: string) => {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId))
}

export type SessionValidateResult = Awaited<
  ReturnType<typeof validateSessionToken>
>
