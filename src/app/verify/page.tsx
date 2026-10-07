"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, HardDrive, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!token) {
      setError('Token verifikasi tidak ditemukan pada tautan.');
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(true);
        } else {
          setError(data.error || 'Verifikasi gagal. Tautan mungkin telah kedaluwarsa.');
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan saat memverifikasi akun.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/admin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, router]);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--card-bg)',
        padding: '36px 30px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
      }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--foreground)' }}>
              Memverifikasi Akun Anda...
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Mohon tunggu sebentar, kami sedang mengaktifkan akun dan menyiapkan kuota 5GB Anda.
            </p>
          </div>
        )}

        {!loading && success && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
              Akun Berhasil Diverifikasi! 🎉
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#f4fbf7',
              border: '1px solid #bbf7d0',
              padding: '12px 18px',
              borderRadius: '10px',
              color: '#166534',
              fontSize: '0.9rem',
              fontWeight: '600',
              width: '100%',
              justifyContent: 'center',
            }}>
              <HardDrive size={20} />
              <span>Kuota Penyimpanan 5.0 GB Telah Aktif</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Selamat datang di Personal Diary! Anda sekarang bebas menyimpan tulisan rahasia, galeri foto, video, dan pembukuan keuangan.
            </p>

            <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600' }}>
              Mengalihkan otomatis ke Dashboard dalam {countdown} detik...
            </p>

            <button
              onClick={() => router.push('/admin')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              Buka Dashboard Sekarang <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!loading && !success && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--foreground)' }}>
              Verifikasi Belum Berhasil
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', width: '100%' }}>
              {error}
            </p>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Jika akun sudah terdaftar, silakan coba login atau daftar ulang dengan email baru.
            </p>

            <Link
              href="/login"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '8px',
              }}
            >
              Menuju Halaman Masuk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Memuat verifikasi...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
