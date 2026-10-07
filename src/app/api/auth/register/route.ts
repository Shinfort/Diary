import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { createAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = (name && String(name).trim()) || cleanEmail.split('@')[0];

    // Determine role: if first user, make admin, else user
    const countRes = await query('SELECT COUNT(*) as count FROM users');
    const isFirstUser = parseInt(countRes.rows[0]?.count || '0', 10) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const insertRes = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [cleanEmail, passwordHash, displayName, role]
    );

    const newUser = insertRes.rows[0];

    // Generate JWT and log in immediately
    const token = createAuthToken(newUser);

    const response = NextResponse.json({
      message: 'Registrasi berhasil!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });

    response.cookies.set({
      name: 'diary_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: req.url.startsWith('https://'),
      maxAge: 60 * 60 * 24 * 14, // 2 weeks
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}
