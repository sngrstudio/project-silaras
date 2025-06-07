/**
 * @fileoverview Authentication Cookie Management
 *
 * This module provides secure cookie handling utilities for authentication
 * in the SILARAS application. It manages session token storage in HTTP-only
 * cookies with security-focused configuration to prevent XSS and CSRF attacks.
 *
 * @features
 * - HTTP-only cookie configuration for security
 * - Environment-aware secure flag handling
 * - SameSite strict policy for CSRF protection
 * - Proper cookie expiration management
 * - Path-based cookie scope control
 * - Cross-context compatibility (API and Actions)
 *
 * @security
 * - httpOnly: true - Prevents JavaScript access to prevent XSS
 * - sameSite: 'strict' - Strict same-site policy for CSRF protection
 * - secure: true (in production) - HTTPS-only cookie transmission
 * - path: '/' - Application-wide cookie scope
 * - expires: Session expiration - Automatic cleanup
 *
 * @constants
 * - AUTH_COOKIE_NAME: Standard cookie name for session tokens
 *
 * @functions
 * - setSessionTokenCookie(): Securely store session token in cookie
 * - deleteSessionTokenCookie(): Clean up session cookie on logout
 *
 * @compatibility
 * - Supports both APIContext and ActionAPIContext
 * - Development and production environment handling
 * - Astro framework integration
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import type { APIContext } from 'astro'
import type { ActionAPIContext } from 'astro:actions'

export const AUTH_COOKIE_NAME = 'auth_session' as const

export const setSessionTokenCookie = (
  ctx: APIContext | ActionAPIContext,
  token: string,
  expiresAt: Date
) => {
  ctx.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    expires: expiresAt,
    path: '/'
  })
}

export const deleteSessionTokenCookie = (
  ctx: APIContext | ActionAPIContext
) => {
  ctx.cookies.delete(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    path: '/'
  })
}
