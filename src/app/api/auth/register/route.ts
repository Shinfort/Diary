import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format data permintaan tidak valid' }, { status: 400 });
    }

    const { email, password, name } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT id, is_verified FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      const userRow = existing.rows[0];
      if (userRow.is_verified) {
        return NextResponse.json({ error: 'Email sudah terdaftar dan terverifikasi. Silakan klik tab Masuk.' }, { status: 409 });
      } else {
        // If user already exists but not verified yet, generate fresh verification token
        const newToken = crypto.randomBytes(32).toString('hex');
        await query(
          `UPDATE users 
           SET verification_token = $1, 
               verification_token_expires = NOW() + INTERVAL '24 hours' 
           WHERE id = $2`,
          [newToken, userRow.id]
        );

        // Determine base URL
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
        const baseUrl = host ? `${proto}://${host}` : 'https://shinejournals.vercel.app';
        const verificationUrl = `${baseUrl}/verify?token=${newToken}`;

        const mailResult = await sendVerificationEmail(cleanEmail, name || cleanEmail, verificationUrl);

        return NextResponse.json({
          message: mailResult.success
            ? 'Akun sudah terdaftar sebelumnya namun belum aktif. Link verifikasi baru telah dikirimkan ke email Anda!'
            : 'Akun sudah terdaftar sebelumnya. Silakan klik link verifikasi di bawah untuk mengaktifkan akun Anda:',
          needVerification: true,
          verificationUrl: mailResult.success ? undefined : verificationUrl,
        }, { status: 200 });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = (name && String(name).trim()) || cleanEmail.split('@')[0];

    // Determine role: if matches admin email or first user, give admin
    const adminEmail = (process.env.SMTP_EMAIL || '').toLowerCase();
    const isOwner = cleanEmail === adminEmail;
    const role = isOwner ? 'admin' : 'user';

    // Generate verification token (valid for 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 5 GB storage limit in bytes (5 * 1024 * 1024 * 1024)
    const storageLimitBytes = 5368709120;

    const insertRes = await query(
      `INSERT INTO users (
        email, 
        password_hash, 
        name, 
        role, 
        is_verified, 
        verification_token, 
        verification_token_expires, 
        storage_limit_bytes, 
        storage_used_bytes
       )
       VALUES ($1, $2, $3, $4, FALSE, $5, NOW() + INTERVAL '24 hours', $6, 0)
       RETURNING id, email, name, role`,
      [cleanEmail, passwordHash, displayName, role, verificationToken, storageLimitBytes]
    );

    const newUser = insertRes.rows[0];

    // Determine base URL dynamically
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const baseUrl = host ? `${proto}://${host}` : 'https://shinejournals.vercel.app';
    const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`;

    // Send verification email
    const mailResult = await sendVerificationEmail(cleanEmail, displayName, verificationUrl);

    return NextResponse.json({
      message: mailResult.success
        ? 'Pendaftaran berhasil! Kami telah mengirimkan link verifikasi ke email Anda. Silakan buka email Anda untuk mengaktifkan akun dan kuota penyimpanan 5GB.'
        : 'Pendaftaran berhasil! Silakan klik link verifikasi di bawah ini untuk mengaktifkan akun dan kuota penyimpanan 5GB Anda:',
      needVerification: true,
      verificationUrl: mailResult.success ? undefined : verificationUrl,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error details:', error);
    const msg = error?.message || 'Gagal melakukan registrasi';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
