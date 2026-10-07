import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'diary-super-secret-production-jwt-key-2026-auth';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  storage_limit_bytes: number;
  storage_used_bytes: number;
};

export async function verifyAuth(): Promise<number | null> {
  const user = await getAuthUser();
  return user ? user.id : null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('diary_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email?: string;
      name?: string;
      role?: string;
    };

    if (!decoded || !decoded.userId) {
      return null;
    }

    // Fetch fresh user data from DB including storage
    const res = await query(
      `SELECT id, email, name, role, 
              COALESCE(storage_limit_bytes, 5368709120) as storage_limit_bytes, 
              COALESCE(storage_used_bytes, 0) as storage_used_bytes 
       FROM users WHERE id = $1`, 
      [decoded.userId]
    );

    if (res.rowCount === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name || 'User',
      role: row.role || 'user',
      storage_limit_bytes: parseInt(row.storage_limit_bytes, 10) || 5368709120,
      storage_used_bytes: parseInt(row.storage_used_bytes, 10) || 0,
    };
  } catch (error) {
    console.error('Auth verification notice:', error);
    return null;
  }
}

export function createAuthToken(user: { id: number; email: string; name?: string; role?: string }) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name || 'User',
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: '14d' }
  );
}
