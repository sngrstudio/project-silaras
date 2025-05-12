import { db } from '../db'
import { settingsTable, menuTable } from '../schema/site'

export const getSettings = async () => {
  return await getSettingsSQL.execute()
}

export const getMenu = async () => {
  return await getMenuSQL.execute()
}

// prepared SQLs

const getSettingsSQL = db.select().from(settingsTable).prepare()

const getMenuSQL = db.select().from(menuTable).prepare()
