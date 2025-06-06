import { mysqlTable, varchar, text } from 'drizzle-orm/mysql-core'

/**
 * Site configuration table for storing key-value pairs of global site settings.
 *
 * This table uses a property-value pattern to store flexible site configuration
 * data without requiring schema changes for new settings.
 *
 * @example
 * ```sql
 * INSERT INTO site (property, value) VALUES ('SITE_NAME', 'My Application');
 * INSERT INTO site (property, value) VALUES ('SITE_DESCRIPTION', 'A comprehensive assessment platform');
 * ```
 */
export const site = mysqlTable('site', {
  /**
   * The configuration property name (primary key).
   * Currently supports:
   * - SITE_NAME: The application's display name
   * - SITE_DESCRIPTION: Brief description of the application
   */
  property: varchar({
    length: 255,
    enum: ['SITE_NAME', 'SITE_DESCRIPTION']
  }).primaryKey(),

  /**
   * The configuration value for the property.
   * Stored as TEXT to support longer descriptions and future extensibility.
   */
  value: text().notNull()
})
