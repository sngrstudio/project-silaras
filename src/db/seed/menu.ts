import { db } from '../db'
import { menuTable } from '../schema/site'
import initialMenu from './data/menu.json' assert { type: 'json' }

type InsertMenuTable = Array<typeof menuTable.$inferInsert>

const seedMenu = async () => {
  await db.insert(menuTable).values(initialMenu as InsertMenuTable)
  console.log('Seeding menu completed!')
}

export default seedMenu
