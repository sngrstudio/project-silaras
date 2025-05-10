import { db } from '../db'
import { settingsTable } from '../schema/site'
import { type InferInsertModel } from 'drizzle-orm'

type InsertSettings = InferInsertModel<typeof settingsTable>

const initialSettings = [
  {
    property: 'SITE_NAME',
    value: 'SILARAS'
  },
  {
    property: 'SITE_DESCRIPTION',
    value: 'Untuk Kotim yang Bebas Stunting'
  }
] satisfies Array<InsertSettings>

const seedSettings = async () => {
  await db.insert(settingsTable).values(initialSettings)
  console.log('Seeding settings completed!')
}

export default seedSettings
