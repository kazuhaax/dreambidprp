import pool from '../config/database.js';

async function run() {
  try {
    const res = await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email", ['admin123', 'admin@dreambid.com']);
    if (res.rows.length === 0) {
      console.log('No user with email admin@dreambid.com found');
    } else {
      console.log('Password set to plain text for', res.rows[0].email);
    }
  } catch (err) {
    console.error('Error updating password:', err.message || err);
  } finally {
    await pool.end();
  }
}

run();
