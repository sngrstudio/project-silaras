import {
  upsertSession,
  getSessionById,
  deleteSessionById,
  deleteSessionsByUserId
} from '~/db/queries/user'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

/**
 * Generates a cryptographically secure random session token.
 * Uses crypto.getRandomValues() to generate 20 random bytes,
 * then encodes them as a base32 string (lowercase, no padding).
 *
 * @returns {string} A random 32-character session token
 */
export const generateSessionToken = () => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

/**
 * Creates a session ID by hashing the provided session token.
 * The session ID is used as the primary key in the database.
 *
 * @param {string} token - The session token to hash
 * @returns {string} A hex-encoded SHA-256 hash of the token
 */
export const createSessionId = (token: string) =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

/**
 * Creates a new session for a user with a 7-day expiration period.
 *
 * @param {string} token - The session token to associate with the session
 * @param {string} userId - The ID of the user to create the session for
 * @returns {Promise<{session: Session, user: User}>} The created session with associated user data
 */
export const createSession = async (token: string, userId: string) => {
  const sessionId = createSessionId(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

  return await upsertSession({
    id: sessionId,
    userId,
    expiresAt
  })
}

/**
 * Validates a session token and handles session expiration/refresh logic.
 *
 * This function:
 * 1. Returns an empty session if no valid session is found
 * 2. Deletes expired sessions and returns an empty session
 * 3. Automatically extends sessions that will expire within 12 hours
 * 4. Returns the valid session data if all checks pass
 *
 * @param {string} token - The session token to validate
 * @returns {Promise<{session?: Session, user?: User}>} The session data if valid, or empty session if invalid
 */
export const validateSessionToken = async (token: string) => {
  const sessionId = createSessionId(token)
  const sessionData = await getSessionById(sessionId)

  if (sessionData?.session) {
    const now = new Date()
    const hoursUntilExpiry =
      (sessionData.session.expiresAt.getTime() - now.getTime()) /
      (1000 * 60 * 60)

    // 1. If session is expired, delete it and return empty session
    if (hoursUntilExpiry <= 0) {
      await invalidateSession(sessionId)
      return {
        session: undefined,
        user: undefined
      }
    }

    // 2. If session will expire in 12 hours, extend it
    if (hoursUntilExpiry <= 12) {
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 7) // Extend for 7 more days

      return await upsertSession({
        id: sessionId,
        userId: sessionData.user.id,
        expiresAt: newExpiresAt
      })
    }
  }

  // 3. Return the session (which may be empty if not found)
  return sessionData
}

/**
 * Invalidates (deletes) a specific session.
 *
 * @param {string} sessionId - The ID of the session to invalidate
 * @returns {Promise<void>}
 */
export const invalidateSession = async (sessionId: string) => {
  await deleteSessionById(sessionId)
}

/**
 * Invalidates (deletes) all sessions belonging to a specific user.
 * Useful for logging out a user from all devices or when changing passwords.
 *
 * @param {string} userId - The ID of the user whose sessions should be invalidated
 * @returns {Promise<void>}
 */
export const invalidateAllSession = async (userId: string) => {
  await deleteSessionsByUserId(userId)
}

/**
 * Type representing the return value of validateSessionToken.
 * Contains optional session and user data, which will be undefined
 * if the session is invalid or expired.
 */
export type UserSession = Awaited<ReturnType<typeof validateSessionToken>>
