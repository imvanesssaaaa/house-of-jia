import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from server/.env')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: true }
    : false,
})

pool.on('error', (error) => {
  console.error('PostgreSQL pool error:', error.message)
})

export async function testDatabaseConnection() {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username
  `)

  return result.rows[0]
}