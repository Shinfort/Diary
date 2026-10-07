import nodemailer from 'nodemailer';

export async function sendVerificationEmail(
  toEmail: string,
  name: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const smtpEmail = process.env.SMTP_EMAIL || '';
  const smtpPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  if (!smtpEmail || !smtpPassword) {
    console.warn('SMTP credentials (SMTP_EMAIL / SMTP_PASSWORD) are not configured in environment variables.');
    return { success: false, error: 'SMTP credentials not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; padding: 30px; border-radius: 12px; border: 1px solid #eceae6; color: #191919;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #191919; font-size: 24px; margin-bottom: 6px; letter-spacing: -0.02em;">Personal Diary</h1>
          <p style="color: #6b6b6b; font-size: 14px; margin: 0;">Ruang Aman untuk Catatan, Kenangan & Keuangan Anda</p>
        </div>

        <div style="background-color: #ffffff; padding: 28px; border-radius: 10px; border: 1px solid #eceae6; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <h2 style="font-size: 18px; margin-top: 0; color: #191919;">Halo, ${name}! 👋</h2>
          <p style="color: #444; line-height: 1.6; font-size: 15px;">
            Terima kasih telah mendaftar di <strong>Personal Diary</strong>. Akun Anda telah disiapkan dengan kapasitas penyimpanan <strong>5.0 GB</strong> untuk menyimpan foto, video, dan cerita harian Anda.
          </p>
          <p style="color: #444; line-height: 1.6; font-size: 15px;">
            Silakan klik tombol di bawah ini untuk mengonfirmasi email dan mengaktifkan akun Anda:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2d6a4f; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);">
              ✓ Verifikasi Akun & Aktifkan 5GB
            </a>
          </div>

          <p style="color: #888; font-size: 13px; line-height: 1.5; margin-top: 20px;">
            Atau salin dan tempelkan tautan berikut ke browser Anda:<br/>
            <a href="${verificationUrl}" style="color: #2d6a4f; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>Tautan verifikasi ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Personal Diary" <${smtpEmail}>`,
      to: toEmail,
      subject: 'Verifikasi Akun Personal Diary Anda - Aktifkan 5GB Penyimpanan',
      html: htmlContent,
      text: `Halo ${name},\n\nTerima kasih telah mendaftar di Personal Diary. Akun Anda telah disiapkan dengan kapasitas penyimpanan 5.0 GB.\n\nKlik tautan berikut untuk mengaktifkan akun Anda:\n${verificationUrl}\n\nTautan ini berlaku selama 24 jam.`,
    });

    console.log('Verification email sent to:', toEmail);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send verification email:', error?.message || error);
    return { success: false, error: error?.message || 'SMTP delivery error' };
  }
}
