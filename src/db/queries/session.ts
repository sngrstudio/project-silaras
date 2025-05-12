import { db } from '../db'
import { sql, eq } from 'drizzle-orm'
import { sessionTable, userView } from '../schema/user'

export const getFreshSession = async (sessionId: string, userId: string) => {
  return await db.transaction(async (tx) => {
    await insertSessionSQL.execute({ sessionId, userId })
    const [freshSession] = await getFreshSessionSQL.execute({ sessionId })
    if (!freshSession) {
      tx.rollback()
      throw new Error('Ada masalah di server kami.')
    }

    return freshSession
  })
}

export const deleteSessionBySessionId = async (sessionId: string) => {
  await deleteSessionBySessionIdSQL.execute({ sessionId })
}

export const deleteSessionByUserId = async (userId: string) => {
  await deleteSessionByUserIdSQL.execute({ userId })
}

export const getValidatedSession = async (sessionId: string) => {
  const emptySession = {
    user: undefined,
    session: undefined
  }

  const [validatedSession] = await getValidatedSessionSQL.execute({ sessionId })
  if (!validatedSession) {
    return emptySession
  }

  const { session } = validatedSession

  if (Date.now() > session.expiresAt.getTime()) {
    await deleteSessionBySessionId(session.id)
    return emptySession
  }

  if (Date.now() > session.expiresAt.getTime() - 1000 * 60 * 60 * 24) {
    return await db.transaction(async (tx) => {
      await updateSessionSQL.execute({ sessionId: session.id })
      const [freshSession] = await getValidatedSessionSQL.execute({ sessionId })
      if (!freshSession) {
        tx.rollback()
        return emptySession
      }

      return freshSession
    })
  }

  return validatedSession
}

// prepared statements

const insertSessionSQL = db
  .insert(sessionTable)
  .values({
    id: sql.placeholder('sessionId'),
    userId: sql.placeholder('userId'),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  })
  .prepare()

const getFreshSessionSQL = db
  .select()
  .from(sessionTable)
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const getValidatedSessionSQL = db
  .select({
    user: {
      userId: userView.userId,
      userName: userView.userName,
      fullName: userView.fullName,
      phoneNumber: userView.phoneNumber,
      profilePhoto: userView.profilePhoto,
      accessLevel: userView.accessLevel
    },
    session: sessionTable
  })
  .from(sessionTable)
  .innerJoin(userView, eq(userView.userId, sessionTable.userId))
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const updateSessionSQL = db
  .update(sessionTable)
  .set({
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  })
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const deleteSessionBySessionIdSQL = db
  .delete(sessionTable)
  .where(eq(sessionTable.id, sql.placeholder('sessionId')))
  .prepare()

const deleteSessionByUserIdSQL = db
  .delete(sessionTable)
  .where(eq(sessionTable.userId, sql.placeholder('userId')))
  .prepare()
