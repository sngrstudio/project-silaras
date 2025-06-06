/**
 * @fileoverview Astro Environment Type Declarations
 *
 * This file provides TypeScript type definitions for Astro's global interfaces,
 * specifically extending the App.Locals interface to include authentication
 * and configuration data available throughout the application context.
 *
 * @features
 * - User session data typing for authenticated requests
 * - Session management interface definitions
 * - Cloudinary configuration for media handling
 * - Type safety for middleware-populated context
 *
 * @interfaces
 * - App.Locals: Request-scoped data available in middleware and pages
 *   - user: Current authenticated user (or undefined)
 *   - session: Current valid session (or undefined)
 *   - cloudName: Cloudinary cloud name for media operations
 *
 * @usage
 * ```typescript
 * // In middleware or API routes
 * const { user, session } = Astro.locals
 * ```
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

declare namespace App {
  interface Locals {
    user: import('~/auth/api').UserSession['user']
    session: import('~/auth/api').UserSession['session']
    cloudName: string | undefined
  }
}
