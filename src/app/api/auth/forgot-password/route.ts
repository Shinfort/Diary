import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format data permintaan tidak valid' }, { status: 400 });
    }

    const { email } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Alamat email wajib diisi' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if user exists
    const userCheck = await query('SELECT id, name FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userCheck.rowCount === 0) {
      return NextResponse.json({ error: 'Email belum terdaftar di Diary' }, { status: 404 });
    }

    // Generate a secure, readable new temporary password (8 characters: uppercase, lowercase, numbers)
    const newPassword = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. A1B2C3D4
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2', [passwordHash, cleanEmail]);

    // Send email using mailer
    const mailResult = await sendPasswordResetEmail(cleanEmail, newPassword);

    if (mailResult.success) {
      return NextResponse.json({
        message: 'Password sementara berhasil dikirim ke email Anda! Silakan periksa kotak masuk atau spam.',
        emailSent: true,
      }, { status: 200 });
    } else {
      // If SMTP fails, provide the temporary password directly on screen so the user is never locked out
      return NextResponse.json({
        message: 'Pengiriman email gagal karena izin SMTP Google ditolak / belum aktif. Namun password akun Anda telah berhasil direset menjadi password sementara di bawah ini:',
        emailSent: false,
        tempPassword: newPassword,
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      error: error?.message || 'Gagal memproses reset password. Silakan coba lagi.',
    }, { status: 500 });
  }
}

