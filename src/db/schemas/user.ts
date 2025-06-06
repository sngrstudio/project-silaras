import { mysqlTable, varchar, int, datetime } from 'drizzle-orm/mysql-core'
import { randomUUID } from 'crypto'
import { region } from './region'

/**
 * User table schema for authentication and profile management.
 *
 * This table stores user account information including authentication credentials,
 * profile data, and access control settings. Users are associated with regions
 * for geographical organization.
 */
export const user = mysqlTable('user', {
  /**
   * Unique identifier for the user (UUID v4).
   * Auto-generated using crypto.randomUUID() for new users.
   */
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => randomUUID()),

  /**
   * Unique username for authentication.
   * Must be unique across all users for login purposes.
   */
  username: varchar('username', { length: 255 }).notNull().unique(),

  /**
   * Access level for role-based authorization.
   * - 1: Admin (full system access)
   * - 2: Editor (default, can edit assessments)
   * - 3: Viewer (read-only access)
   */
  accessLevel: int('access_level').notNull().default(2),

  /**
   * Hashed password for authentication.
   * Nullable to support future OAuth implementations.
   */
  passwordHash: varchar('password_hash', { length: 255 }),

  /**
   * User's full display name.
   * Used for profile display and identification.
   */
  fullName: varchar('full_name', { length: 255 }).notNull(),

  /**
   * Optional phone number for contact purposes.
   * Must be unique if provided to prevent duplicates.
   */
  phoneNumber: varchar('phone_number', { length: 32 }).unique(),

  /**
   * Optional profile photo URL.
   * Typically points to Cloudinary hosted images.
   */
  profilePhoto: varchar('profile_photo', { length: 255 }),

  /**
   * Foreign key reference to the user's assigned region.
   * Determines which regional data the user can access.
   * Defaults to empty string for users without region assignment.
   */
  regionId: varchar('region_id', { length: 36 })
    .references(() => region.id, {
      onDelete: 'no action',
      onUpdate: 'no action'
    })
    .default('')
})

/**
 * Session table for managing user authentication sessions.
 *
 * This table tracks active user sessions with expiration times for security.
 * Sessions are automatically cleaned up when users are deleted (cascade).
 */
export const session = mysqlTable('session', {
  /**
   * Unique session identifier (primary key).
   * Generated as a secure random string for each session.
   */
  id: varchar('id', { length: 255 }).primaryKey().notNull(),

  /**
   * Foreign key reference to the authenticated user.
   * Sessions are deleted when the associated user is removed.
   */
  userId: varchar('user_id', { length: 36 }).references(() => user.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),

  /**
   * Session expiration timestamp.
   * Sessions are invalid after this date and should be cleaned up.
   */
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull()
})
