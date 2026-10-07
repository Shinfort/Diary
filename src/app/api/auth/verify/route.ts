import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createAuthToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token verifikasi tidak ditemukan' }, { status: 400 });
    }

    const res = await query(
      `SELECT id, email, name, role, is_verified, verification_token_expires 
       FROM users 
       WHERE verification_token = $1`,
      [token]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Token verifikasi tidak valid atau akun sudah terverifikasi.' }, { status: 400 });
    }

    const user = res.rows[0];

    // Check expiration
    if (new Date(user.verification_token_expires).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Tautan verifikasi telah kedaluwarsa. Silakan daftar ulang atau minta tautan baru.' }, { status: 410 });
    }

    // Activate user
    await query(
      `UPDATE users 
       SET is_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL 
       WHERE id = $1`,
      [user.id]
    );

    // Create session token and log in
    const authToken = createAuthToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Akun Anda berhasil diverifikasi! Penyimpanan 5.0 GB aktif.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }, { status: 200 });

    response.cookies.set({
      name: 'diary_token',
      value: authToken,
      httpOnly: true,
      path: '/',
      secure: req.url.startsWith('https://'),
      maxAge: 60 * 60 * 24 * 14, // 2 weeks
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ error: 'Gagal memverifikasi akun' }, { status: 500 });
  }
}
