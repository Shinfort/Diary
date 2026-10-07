import { Pool } from 'pg';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
  schemaEnsured: boolean | undefined;
};

const connectionString = process.env.DATABASE_URL;

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export async function ensureSchema() {
  if (globalForPg.schemaEnsured) return;
  if (!connectionString) {
    console.warn('Cannot ensure schema: DATABASE_URL environment variable is missing.');
    return;
  }
  globalForPg.schemaEnsured = true;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT 'User',
        role VARCHAR(50) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        verification_token_expires TIMESTAMP WITH TIME ZONE,
        storage_limit_bytes BIGINT DEFAULT 5368709120,
        storage_used_bytes BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 5368709120;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;

      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(100) DEFAULT 'Happy',
        photos JSONB DEFAULT '[]',
        videos JSONB DEFAULT '[]',
        media_size_bytes BIGINT DEFAULT 0,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';
      ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS media_size_bytes BIGINT DEFAULT 0;
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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please add it to your Environment Variables.');
  }
  await ensureSchema();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
