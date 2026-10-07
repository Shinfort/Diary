const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Please add it to .env.local');
    process.exit(1);
  }

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';`);

    // 2. Diary entries table
    await client.query(`
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
    `);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';`);
    await client.query(`ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';`);
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

    // 4. Financial records table (Catatan Keuangan)
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

    // Seeding default profile if empty
    const profileRes = await client.query('SELECT id FROM diary_profile LIMIT 1');
    if (profileRes.rowCount === 0) {
      console.log('Seeding default profile...');
      await client.query(`
        INSERT INTO diary_profile (name, pronouns, farm, status, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Putri Utari', 'She/Her', 'Songbird Farm', 'Active', '']);
      console.log('Default profile seeded!');
    }

    // Seeding default admin user if empty
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    if (userRes.rowCount === 0) {
      console.log('Seeding default administrator...');
      const defaultEmail = process.env.SMTP_EMAIL || 'admin@diary.com';
      const defaultPassword = 'adminpassword123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      await client.query(`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ($1, $2, $3, $4)
      `, [defaultEmail, passwordHash, 'Admin Diary', 'admin']);
      console.log('DEFAULT ADMINISTRATOR SEEDED:', defaultEmail);
    }

  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
