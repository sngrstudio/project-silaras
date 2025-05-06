import { db } from '../db'
import { settingsTable } from '../schema/site'
import { type InferInsertModel } from 'drizzle-orm'

type InsertSettings = InferInsertModel<typeof settingsTable>

const initialSettings = [
  {
    property: 'SITE_NAME',
    value: 'Dashat Kotim'
  },
  {
    property: 'SITE_DESCRIPTION',
    value: 'Untuk Kotim yang Sehat'
  }
] satisfies Array<InsertSettings>

export const seedSettings = async () => {
  await db.insert(settingsTable).values(initialSettings)
}
