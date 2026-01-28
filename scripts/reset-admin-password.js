import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function run() {
  try {
    const newPassword = 'admin123';
    const hash = await bcrypt.hash(newPassword, 10);
    const res = await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email", [hash, 'admin@dreambid.com']);
    if (res.rows.length === 0) {
      console.log('No user with email admin@dreambid.com found');
    } else {
      console.log('Password updated for', res.rows[0].email);
    }
  } catch (err) {
    console.error('Error updating password:', err.message || err);
  } finally {
    await pool.end();
  }
}

run();
