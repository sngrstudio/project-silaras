import {
  getFreshSession,
  getValidatedSession,
  deleteSessionBySessionId,
  deleteSessionByUserId
} from '~/db/queries/session'
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

export const createSessionId = (token: string) =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

export const createSession = async (token: string, userId: string) => {
  const sessionId = createSessionId(token)

  return await getFreshSession(sessionId, userId)
}

export const validateSessionToken = async (token: string) => {
  const sessionId = createSessionId(token)

  return await getValidatedSession(sessionId)
}

export const invalidateSession = async (sessionId: string) => {
  await deleteSessionBySessionId(sessionId)
}

export const invalidateAllSession = async (userId: string) => {
  await deleteSessionByUserId(userId)
}

// types

export type UserSession = Awaited<ReturnType<typeof validateSessionToken>>
