import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./crm.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDB();
  }
});

// Promisify database operations
export const run = promisify(db.run.bind(db)) as (sql: string, params?: any) => Promise<any>;
export const get = promisify(db.get.bind(db)) as (sql: string, params?: any) => Promise<any>;
export const all = promisify(db.all.bind(db)) as (sql: string, params?: any) => Promise<any[]>;

async function initializeDB() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      source TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'New',
      deal_value REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      content TEXT NOT NULL,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    )
  `);

  // Create default admin user if not exists
  const admin = await get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  if (!admin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await run('INSERT INTO users (email, password) VALUES (?, ?)', ['admin@example.com', hashedPassword]);
    console.log('Admin user created.');
  }
}

export default db;
