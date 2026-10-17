"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';
import styles from './login.module.css';

export default function Login() {
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setTempPassword('');
    setLoading(true);

    try {
      if (authMode === 'login') {
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light, #e8f5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent, #2d6a4f)',
          }}>
            {authMode === 'login' ? <Lock size={22} /> : <ShieldCheck size={22} />}
          </div>
        </div>

        <h2 style={{ textAlign: 'center' }}>
          {authMode === 'login' ? 'Login Administrator' : 'Pemulihan Sandi Admin'}
        </h2>

        <p className={styles.authDescription} style={{ textAlign: 'center' }}>
          {authMode === 'login'
            ? 'Akses masuk khusus pengelola jurnal. Pengunjung umum dapat membaca seluruh catatan di beranda tanpa perlu login.'
            : 'Masukkan alamat email administrator terdaftar untuk menerima password sementara.'}
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
          </div>
        )}

        <div className={styles.inputGroup}>
          <label>Email Administrator</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@email.com"
            required
          />
        </div>

        {authMode === 'login' && (
          <div className={styles.inputGroup}>
            <label>Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Memproses...' : (
            authMode === 'login' ? 'Masuk sebagai Admin' : 'Kirim Email Pemulihan'
          )}
        </button>

        {/* Bottom Switchers */}
        <div className={styles.toggleText}>
          {authMode === 'login' ? (
            <p style={{ textAlign: 'center', marginTop: '6px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); setError(''); setMessage(''); }}>
                Lupa Password Admin?
              </a>
            </p>
          ) : (
            <p style={{ textAlign: 'center' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setError(''); setMessage(''); }}>
                ← Kembali ke Halaman Masuk Admin
              </a>
            </p>
          )}
        </div>

        <Link href="/" className={styles.backHomeLink}>
          ← Kembali ke Halaman Utama (Mode Baca)
        </Link>
      </form>
    </div>
  );
}
