import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Read the setup script
    const setupScript = fs.readFileSync(
      path.join(__dirname, '../setup-database.sql'),
      'utf-8'
    );

    // Split into individual statements and execute
    const statements = setupScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      } catch (error) {
        // Log error but continue (tables might already exist)
        if (error.code !== '42P07') { // 42P07 = relation already exists
          console.warn('Warning:', error.message);
        }
      }
    }

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
