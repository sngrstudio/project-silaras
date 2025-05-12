import { db } from '../db'
import { eq } from 'drizzle-orm'
import { settingsTable, menuTable } from '../schema/site'

export const getSettings = async () => {
  return await getSettingsSQL.execute()
}

export const getMenu = async () => {
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

  return await getSettingsSQL.execute()
}

// prepared SQLs

const getSettingsSQL = db.select().from(settingsTable).prepare()

const getMenuSQL = db.select().from(menuTable).prepare()

// types

export type UpdateSettingsArgs = Parameters<typeof updateSettings>[number]
