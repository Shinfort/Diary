import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { createAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user
    const res = await query('SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = res.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Generate JWT
    const token = createAuthToken(user);

    // Set cookie
    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: user.role || 'user',
      },
    }, { status: 200 });

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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
