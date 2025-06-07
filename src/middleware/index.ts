/**
 * @fileoverview Astro Middleware - Authentication Handler
 *
 * This module implements the core authentication middleware for the SILARAS
 * application. It runs on every request to validate user sessions, manage
 * authentication cookies, and populate request context with user information.
 *
 * @features
 * - Session token validation on every request
 * - Automatic cookie management and renewal
 * - User context population for downstream handlers
 * - Graceful handling of invalid or expired sessions
 * - Security-focused session cleanup
 *
 * @flow
 * 1. Extract session token from authentication cookie
 * 2. Validate token against database session records
 * 3. Refresh cookie expiration if session is valid
 * 4. Clean up invalid cookies and sessions
 * 5. Populate request locals with user/session data
 *
 * @security
 * - Validates all session tokens against database
 * - Automatically cleans up expired sessions
 * - Prevents session fixation attacks
 * - Secures cookie handling with proper flags
 *
 * @context
 * - ctx.locals.user: Current authenticated user (or undefined)
 * - ctx.locals.session: Current valid session (or undefined)
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { defineMiddleware } from 'astro:middleware'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  AUTH_COOKIE_NAME
} from '~/auth/cookies'
import { validateSessionToken } from '~/auth/api'

export const onRequest = defineMiddleware(async (ctx, next) => {
  const token = ctx.cookies.get(AUTH_COOKIE_NAME)?.value ?? undefined
  if (!token) {
    ctx.locals.user = undefined
    ctx.locals.session = undefined
    return next()
  }

  const { user, session } = await validateSessionToken(token)
  if (!session) {
    deleteSessionTokenCookie(ctx)
  } else {
    setSessionTokenCookie(ctx, token, session.expiresAt)
  }

  ctx.locals.user = user
  ctx.locals.session = session
  return next()
})
