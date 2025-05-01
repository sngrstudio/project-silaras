import { drizzle } from 'drizzle-orm/mysql2'

const { DATABASE_URL } = process.env

export const db = drizzle(DATABASE_URL)
