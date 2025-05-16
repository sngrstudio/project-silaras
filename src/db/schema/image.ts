import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const presignedImageTable = mysqlTable('presigned_image_url', {
  fileName: varchar('file_name', {
    length: 255
  }).primaryKey(),
  presignedUrl: varchar('presigned_url', {
    length: 511
  }).notNull(),
  expiresAt: datetime('expires_at').notNull()
})
