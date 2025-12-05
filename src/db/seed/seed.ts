import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function seed() {
  try {
    console.log('🌱 Starting SILARAS database seeding...')

    // Read the SQL seed file
    const sqlFilePath = join(__dirname, 'seed.sql')
    const sqlContent = readFileSync(sqlFilePath, 'utf-8')

    console.log('📄 SQL seed file loaded successfully')
    console.log('🔄 Executing SQL seed script...')

    // Create a dedicated Drizzle instance with multi-statement support
    // This preserves MySQL session variables (@kabupaten_id, etc.) across statements
    const seedPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      multipleStatements: true // Enable multi-statement queries
    })

    const seedDb = drizzle(seedPool, {
      logger:
        process.env.NODE_ENV === 'development' ||
        process.env.DB_DEBUG === 'true'
    })

    try {
      // Remove comments and empty lines for cleaner execution
      const cleanedSql = sqlContent
        .split('\n')
        .filter(
          (line) => !line.trim().startsWith('--') && line.trim().length > 0
        )
        .join('\n')
        .trim()

      console.log(
        '📝 Executing SQL seed script as single multi-statement query...'
      )

      // Execute the entire SQL content in one go to maintain session context
      await seedDb.execute(cleanedSql)

      console.log('✅ SQL seed script executed successfully!')
    } catch (error) {
      console.error('❌ Error executing SQL seed script:')
      console.error('Error details:', error)
      throw error
    } finally {
      // Always close the dedicated pool
      await seedPool.end()
    }

    console.log('✅ SQL seed script executed successfully!')
    console.log('🎉 SILARAS database seeding completed!')
    console.log('')
    console.log('📊 Seeded data summary:')
    console.log('   • 203 regions (1 KABUPATEN + 17 KECAMATAN + 185 DESA)')
    console.log('   • 6 monthly assessment templates (July-December 2025)')
    console.log('   • 181 daily assessment entries (30-31 days per month)')
    console.log('   • 3 site properties configured')
  } catch (error) {
    console.error('💥 Seed process failed:', error)
    throw error
  }
}

seed()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
