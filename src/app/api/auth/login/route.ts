import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { createAuthToken } from '@/lib/auth';

const ALLOWED_ADMIN_EMAIL = 'p.utari087@gmail.com'.toLowerCase();

// Rate limiting in-memory store
// IP -> { count: number, firstAttempt: number, lockedUntil?: number }
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(clientIp);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / (60 * 1000));
    return { allowed: false, waitMinutes };
  }

  // Reset window after 15 minutes
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(clientIp);
    return { allowed: true };
  }

  // Maximum 5 failed attempts per 15 minutes
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
    return { allowed: false, waitMinutes: 15 };
  }

  return { allowed: true };
}

function recordFailedAttempt(clientIp: string) {
  const now = Date.now();
  const entry = loginAttempts.get(clientIp) || { count: 0, firstAttempt: now };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(clientIp, entry);
}

function resetAttempts(clientIp: string) {
  loginAttempts.delete(clientIp);
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        error: `Terlalu banyak percobaan login yang gagal. Akses ditangguhkan selama ${rateCheck.waitMinutes} menit demi keamanan.`,
      }, { status: 429 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format data permintaan tidak valid' }, { status: 400 });
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 2. Strict Admin Email Authorization
    if (cleanEmail !== ALLOWED_ADMIN_EMAIL) {
      recordFailedAttempt(clientIp);
      return NextResponse.json({
        error: 'Akses ditolak. Email tidak terdaftar sebagai administrator.',
      }, { status: 403 });
    }

    // 3. Find user in database
    const res = await query(
      'SELECT id, email, name, role, password_hash, is_verified FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (res.rowCount === 0) {
      recordFailedAttempt(clientIp);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = res.rows[0];

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      recordFailedAttempt(clientIp);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // 5. Verification status & Role check
    if (user.is_verified === false) {
      return NextResponse.json({
        error: 'Akun administrator belum aktif. Silakan hubungi dukungan teknis.',
      }, { status: 403 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({
        error: 'Akses ditolak. Akun tidak memiliki peran Administrator.',
      }, { status: 403 });
    }

    // Success - clear failed attempts counter
    resetAttempts(clientIp);

    // 6. Generate secure JWT & set HTTP-only cookie
    const token = createAuthToken(user);

    const response = NextResponse.json({
      message: 'Login administrator berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'Admin',
        role: user.role,
      },
    }, { status: 200 });

    response.cookies.set({
      name: 'diary_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: req.url.startsWith('https://'),
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
