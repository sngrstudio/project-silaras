/**
 * @fileoverview Database Connection Configuration
 *
 * This module establishes the primary database connection for the SILARAS
 * application using Drizzle ORM with MySQL2 driver. It configures connection
 * pooling, logging, and provides the central database instance used throughout
 * the application.
 *
 * @features
 * - MySQL connection pooling for optimal performance
 * - Environment-based configuration via DATABASE_URL
 * - Development and debug logging support
 * - Drizzle ORM integration for type-safe queries
 * - Connection management and resource cleanup
 *
 * @configuration
 * - DATABASE_URL: MySQL connection string (required)
 * - DB_DEBUG: Enable query logging in production (optional)
 * - Automatic logging in development environment
 *
 * @usage
 * ```typescript
 * import { db } from '~/db/db'
 *
 * const users = await db.select().from(user)
 * ```
 *
 * @dependencies
 * - drizzle-orm/mysql2: Type-safe query builder
 * - mysql2/promise: MySQL database driver with Promise support
 *
 * @author SNGR Creative
 * @version 1.0.0
 * @since 2024
 */

import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL
})

export const db = drizzle(pool, {
  logger: import.meta.env.DEV || process.env.DB_DEBUG === 'true'
})
