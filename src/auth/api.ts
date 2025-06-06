/**
 * @fileoverview Authentication API Module
 *
 * This module provides core authentication functionality for the SILARAS
 * application, including session management, token generation, and validation.
 * It implements secure session handling with cryptographic token generation
 * and database-backed session storage.
 *
 * @features
 * - Cryptographically secure session token generation
 * - Session creation and lifecycle management
 * - Token validation and user authentication
 * - Session cleanup and invalidation
 * - Multi-session support per user
 * - Automatic session expiration handling
 *
 * @security
 * - Uses crypto.getRandomValues() for secure random token generation
 * - SHA-256 hashing for session ID derivation
 * - Base32 encoding without padding for URL-safe tokens
 * - 7-day session expiration with automatic cleanup
 * - Session invalidation on logout or security events
 *
 * @tokenFlow
 * 1. Generate random 20-byte token using crypto.getRandomValues()
 * 2. Encode token as base32 (lowercase, no padding) for client storage
 * 3. Hash token with SHA-256 to create session ID for database storage
 * 4. Store session with user association and expiration timestamp
 *
 * @functions
 * - generateSessionToken(): Create cryptographically secure tokens
 * - createSessionId(): Derive database session ID from token
 * - createSession(): Initialize new user session
 * - validateSessionToken(): Authenticate and refresh sessions
 * - invalidateSession(): Clean up individual sessions
 * - invalidateAllSession(): Clean up all user sessions
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

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
 */
export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

/**
 * Creates a session ID by hashing the provided session token.
 * The session ID is used as the primary key in the database.
 */
export const createSessionId = (token: string): string =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

/**
 * Creates a new session for a user with a 7-day expiration period.
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
 */
export const invalidateSession = async (sessionId: string): Promise<void> => {
  await deleteSessionById(sessionId)
}

/**
 * Invalidates (deletes) all sessions belonging to a specific user.
 * Useful for logging out a user from all devices or when changing passwords.
 */
export const invalidateAllSession = async (userId: string): Promise<void> => {
  await deleteSessionsByUserId(userId)
}

/**
 * Type representing the return value of validateSessionToken.
 * Contains optional session and user data, which will be undefined
 * if the session is invalid or expired.
 */
export type UserSession = Awaited<ReturnType<typeof validateSessionToken>>
