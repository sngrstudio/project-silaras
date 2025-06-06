/**
 * @fileoverview Astro Actions Entry Point
 *
 * This module serves as the central export point for all Astro server actions
 * in the SILARAS application. It aggregates action modules from different
 * domains and exposes them through a unified server interface.
 *
 * @features
 * - Centralized action module exports
 * - Type-safe server action aggregation
 * - Domain-specific action organization
 * - Clean separation of concerns
 *
 * @domains
 * - region: Geographic region management actions
 * - target: Beneficiary/target management actions
 * - assesment: Health assessment and tracking actions
 * - user: User management and authentication actions
 * - site: Site settings and configuration actions
 *
 * @usage
 * ```typescript
 * import { actions } from 'astro:actions'
 * await actions.user.login(credentials)
 * await actions.region.createRegion(data)
 * ```
 *
 * @see {@link https://docs.astro.build/en/guides/actions/} Astro Actions Documentation
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import region from './region'
import target from './target'
import assessment from './assessment'
import user from './user'
import site from './site'

export const server = { region, target, assessment, user, site }
