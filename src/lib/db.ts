import { Pool } from 'pg';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
  schemaEnsured: boolean | undefined;
};

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_whaHblM2KS4W@ep-misty-wildflower-ao71df7d-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '')
  ? process.env.DATABASE_URL
  : DEFAULT_DATABASE_URL;

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export async function ensureSchema() {
  if (globalForPg.schemaEnsured) return;
  globalForPg.schemaEnsured = true;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT 'User',
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(100) DEFAULT 'Happy',
        photos JSONB DEFAULT '[]',
        videos JSONB DEFAULT '[]',
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS diary_profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pronouns VARCHAR(100),
        farm VARCHAR(255),
        status VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financial_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Database schema check notice:', error);
  }
}

export async function query(text: string, params?: any[]) {
  await ensureSchema();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
