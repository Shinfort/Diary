"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setVerificationLink('');
    setTempPassword('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (password.length < 6) {
          setError('Password minimal 6 karakter');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Konfirmasi password tidak cocok');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (res.ok) {
          if (data.needVerification) {
            setMessage(data.message || 'Link verifikasi telah dikirimkan ke email Anda.');
            if (data.verificationUrl) {
              setVerificationLink(data.verificationUrl);
            }
          } else {
            router.push('/admin');
            router.refresh();
          }
        } else {
          setError(data.error || 'Gagal mendaftar');
        }
      } else if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
          router.push('/admin');
          router.refresh();
        } else {
          setError(data.error || 'Email atau password salah');
        }
      } else if (authMode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage(data.message || 'Instruksi reset telah dikirim ke email.');
          if (data.tempPassword) {
            setTempPassword(data.tempPassword);
          }
        } else {
          setError(data.error || 'Gagal memproses permintaan.');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleAuth} className={styles.authForm}>
        {/* Auth Mode Tabs */}
        {authMode !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setMessage(''); setVerificationLink(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.95rem',
                fontWeight: authMode === 'login' ? '700' : '500',
                color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: authMode === 'login' ? '2px solid var(--primary)' : 'none',
              }}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setMessage(''); setVerificationLink(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.95rem',
                fontWeight: authMode === 'register' ? '700' : '500',
                color: authMode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: authMode === 'register' ? '2px solid var(--primary)' : 'none',
              }}
            >
              Daftar Akun
            </button>
          </div>
        )}

        <h2>
          {authMode === 'register' && 'Buat Akun Diary'}
          {authMode === 'login' && 'Masuk ke Akun'}
          {authMode === 'forgot' && 'Reset Password'}
        </h2>

        <p className={styles.authDescription}>
          {authMode === 'register' && 'Daftar untuk mengaktifkan akun personal dan kuota penyimpanan 5.0 GB.'}
          {authMode === 'login' && 'Masukkan email dan password untuk mengakses catatan dan keuangan Anda.'}
          {authMode === 'forgot' && 'Masukkan alamat email Anda untuk menerima password sementara.'}
        </p>

        {error && <p className={styles.error}>{error}</p>}
        {message && (
          <div className={styles.success}>
            <p>{message}</p>
            {tempPassword && (
              <div style={{ marginTop: '14px', background: '#fdf6e2', padding: '14px', borderRadius: '8px', border: '1px solid #eedda6', color: '#8a6d3b' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Password Sementara Akun Anda:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={tempPassword}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      padding: '8px 12px',
                      background: '#fff',
                      border: '1px solid #dcd5c0',
                      borderRadius: '6px',
                      color: '#2d6a4f',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      alert('Password berhasil disalin!');
                    }}
                    style={{
                      padding: '8px 14px',
                      background: '#2d6a4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Salin
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setPassword(tempPassword);
                    setError('');
                  }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '10px',
                    background: '#191919',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Gunakan Password Ini & Masuk ke Akun →
                </button>
              </div>
            )}
            {verificationLink && (
              <div style={{ marginTop: '12px' }}>
                <a
                  href={verificationLink}
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  ✓ Klik untuk Verifikasi Akun Sekarang (5GB)
                </a>
              </div>
            )}
          </div>
        )}

        {authMode === 'register' && (
          <div className={styles.inputGroup}>
            <label>Nama Lengkap / Panggilan</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Putri Utari"
              required
            />
          </div>
        )}

        <div className={styles.inputGroup}>
          <label>Alamat Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
          />
        </div>

        {authMode !== 'forgot' && (
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>
        )}

        {authMode === 'register' && (
          <div className={styles.inputGroup}>
            <label>Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password di atas"
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Memproses...' : (
            authMode === 'register' ? 'Daftar & Kirim Link Verifikasi' :
            authMode === 'login' ? 'Masuk ke Akun' : 'Kirim Email Pemulihan'
          )}
        </button>

        {/* Bottom Switchers */}
        <div className={styles.toggleText}>
          {authMode === 'login' && (
            <p style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); setError(''); setMessage(''); setVerificationLink(''); }}>
                Lupa Password?
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); setError(''); setMessage(''); setVerificationLink(''); }}>
                Belum punya akun? Daftar
              </a>
            </p>
          )}

          {authMode === 'register' && (
            <p>
              Sudah punya akun?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setError(''); setMessage(''); setVerificationLink(''); }}>
                Masuk di sini
              </a>
            </p>
          )}

          {authMode === 'forgot' && (
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setError(''); setMessage(''); setVerificationLink(''); }}>
                ← Kembali ke Halaman Masuk
              </a>
            </p>
          )}
        </div>

        <Link href="/" className={styles.backHomeLink}>
          ← Kembali ke Halaman Utama
        </Link>
      </form>
    </div>
  );
}
