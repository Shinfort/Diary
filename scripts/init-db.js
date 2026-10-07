const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please ensure it is present in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  const client = await pool.connect();

  try {
    console.log('Running database setup and migrations...');

    // 1. Users table
    await client.query(`
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
    `);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 5368709120;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;`);

    // Ensure existing user is verified
    await client.query(`UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL OR is_verified = FALSE;`);

    // 2. Diary entries table
    await client.query(`
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
    `);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';`);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS media_size_bytes BIGINT DEFAULT 0;`);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`);

    // 3. Diary profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS diary_profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pronouns VARCHAR(100),
        farm VARCHAR(255),
        status VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Financial records table
    await client.query(`
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

    console.log('Tables and migrations updated successfully!');

  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
