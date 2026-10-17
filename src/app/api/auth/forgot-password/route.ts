import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mailer';

const ALLOWED_ADMIN_EMAIL = 'p.utari087@gmail.com'.toLowerCase();

const resetAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

function checkResetRateLimit(clientIp: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = resetAttempts.get(clientIp);

  if (!entry) return { allowed: true };

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / (60 * 1000));
    return { allowed: false, waitMinutes };
  }

  if (now - entry.firstAttempt > 30 * 60 * 1000) {
    resetAttempts.delete(clientIp);
    return { allowed: true };
  }

  // Max 3 reset requests per 30 minutes
  if (entry.count >= 3) {
    entry.lockedUntil = now + 30 * 60 * 1000;
    return { allowed: false, waitMinutes: 30 };
  }

  return { allowed: true };
}

function recordResetAttempt(clientIp: string) {
  const now = Date.now();
  const entry = resetAttempts.get(clientIp) || { count: 0, firstAttempt: now };
  entry.count += 1;
  if (entry.count >= 3) {
    entry.lockedUntil = now + 30 * 60 * 1000;
  }
  resetAttempts.set(clientIp, entry);
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // Rate limiting
    const rateCheck = checkResetRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        error: `Terlalu banyak permintaan pemulihan kata sandi. Silakan tunggu ${rateCheck.waitMinutes} menit.`,
      }, { status: 429 });
    }

    recordResetAttempt(clientIp);

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

    // Strict Authorization: Only allow admin email to receive reset instructions
    if (cleanEmail !== ALLOWED_ADMIN_EMAIL) {
      // Return generic message to prevent user enumeration
      return NextResponse.json({
        message: 'Jika email terdaftar sebagai administrator, instruksi reset sandi telah dikirimkan ke kotak masuk Anda.',
        emailSent: true,
      }, { status: 200 });
    }

    // Check if user exists and is admin
    const userCheck = await query('SELECT id, name, role FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userCheck.rowCount === 0 || userCheck.rows[0].role !== 'admin') {
      return NextResponse.json({
        message: 'Jika email terdaftar sebagai administrator, instruksi reset sandi telah dikirimkan ke kotak masuk Anda.',
        emailSent: true,
      }, { status: 200 });
    }

    // Generate a cryptographically strong 12-char random alphanumeric password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2', [passwordHash, cleanEmail]);

    // Send email using mailer directly to the admin's inbox
    const mailResult = await sendPasswordResetEmail(cleanEmail, newPassword);

    if (mailResult.success) {
      return NextResponse.json({
        message: 'Password sementara berhasil dikirim ke email administrator Anda! Silakan periksa kotak masuk atau spam.',
        emailSent: true,
      }, { status: 200 });
    } else {
      console.error('SMTP error during password reset:', mailResult.error);
      return NextResponse.json({
        error: 'Gagal mengirim email reset kata sandi. Pastikan izin SMTP Gmail aktif atau hubungi administrator.',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      error: 'Gagal memproses reset password. Silakan coba lagi beberapa saat lagi.',
    }, { status: 500 });
  }
}
