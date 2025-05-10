import { db } from '../db'
import { menuTable } from '../schema/site'
import { type InferInsertModel } from 'drizzle-orm'

type InsertMenu = InferInsertModel<typeof menuTable>

const initialMenu = [
  {
    label: 'Beranda',
    path: '/'
  },
  {
    label: 'Profil Pengguna',
    path: '/user/profile',
    category: 'Pengguna'
  },
  {
    label: 'Pengaturan Situs',
    path: '/settings/site',
    category: 'Administrasi'
  },
  {
    label: 'Pengaturan Pengguna',
    path: '/settings/users',
    category: 'Administrasi'
  },
  {
    label: 'Pengaturan Daerah',
    path: '/settings/regions',
    category: 'Administrasi'
  }
] satisfies Array<InsertMenu>

const seedMenu = async () => {
  await db.insert(menuTable).values(initialMenu)
  console.log('Seeding menu completed!')
}

export default seedMenu
