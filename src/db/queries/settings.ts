import { db } from '../db'
import { settingsTable, menuTable } from '../schema/site'
import { eq } from 'drizzle-orm'

export const getSettings = async () => {
  const getSettingsSQL = db.select().from(settingsTable).prepare()
  return await getSettingsSQL.execute()
}

export const getMenu = async () => {
  const getMenuSQL = db.select().from(menuTable).prepare()
  return await getMenuSQL.execute()
}

export const updateSettings = async ({
  name,
  description,
  logo
}: {
  name?: string | undefined
  description?: string | undefined
  logo?: string | undefined
}) => {
  await db.transaction(async (tx) => {
    await tx
      .update(settingsTable)
      .set({
        property: 'SITE_NAME',
        value: name
      })
      .where(eq(settingsTable.property, 'SITE_NAME'))

    await tx
      .update(settingsTable)
      .set({
        property: 'SITE_DESCRIPTION',
        value: description
      })
      .where(eq(settingsTable.property, 'SITE_DESCRIPTION'))

    await tx
      .update(settingsTable)
      .set({
        property: 'SITE_LOGO',
        value: logo
      })
      .where(eq(settingsTable.property, 'SITE_LOGO'))
  })

  return await getSettings()
}
