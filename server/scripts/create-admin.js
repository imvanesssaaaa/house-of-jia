import 'dotenv/config'
import bcrypt from 'bcrypt'
import { pool } from '../src/db.js'

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env')
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error('Use a password between 12 and 128 characters.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await pool.query(
    `INSERT INTO admins (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         role = 'admin'`,
    [email, passwordHash],
  )

  console.log(`Administrator account ready: ${email}`)
}

try {
  await createAdmin()
} catch (error) {
  console.error('Could not create administrator:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}