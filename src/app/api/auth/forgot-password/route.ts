import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rowCount === 0) {
      // Don't reveal that the user doesn't exist for security reasons,
      // but in this private app, we can just say invalid email.
      return NextResponse.json({ error: 'Email not registered' }, { status: 404 });
    }

    // Generate a new random password
    const newPassword = crypto.randomBytes(6).toString('hex'); // 12 character password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in db
    await query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Assuming gmail as per user preference
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your New Password for My Private Diary',
      text: `Your password has been reset.\n\nYour new password is: ${newPassword}\n\nPlease login and keep this password safe.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'New password sent to your email successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error while sending email' }, { status: 500 });
  }
}
