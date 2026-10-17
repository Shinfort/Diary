"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DiaryBook from '@/components/DiaryBook';
import EntriesTab from '@/components/tabs/EntriesTab';
import ThemeToggle from '@/components/ThemeToggle';
import KuromiMikuBanner from '@/components/KuromiMikuBanner';
import { BookOpen, Lock, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not logged in
      }
    }
    checkUser();
  }, []);

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
        <BookOpen size={24} />
      </div>
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--foreground)', fontFamily: 'var(--font-reading)', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: '1.3' }}>
          Shine Journal &mdash; Personal Diary
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Ruang tenang untuk catatan harian, linimasa cerita, serta galeri foto &amp; video memori.
        </p>
      </div>

      {/* Kuromi & Miku Mascot Banner (visible when theme is active) */}
      <KuromiMikuBanner />

      {/* Navigation */}
      <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: 'white',
            backgroundColor: 'var(--primary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            textAlign: 'left',
            border: 'none',
          }}
        >
          <BookOpen size={16} /> Linimasa Catatan
        </button>
      </div>

      {/* Auth action section */}
      <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Halo, <strong>{user.name}</strong>
            </span>
            <Link
              href="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              <LayoutDashboard size={16} /> Buka Dashboard
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              href="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              <Lock size={15} /> Masuk sebagai Admin
            </Link>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
              Mode Baca &bull; Anonim dapat langsung melihat catatan
            </span>
          </div>
        )}
      </div>

      {/* Theme Switcher */}
      <ThemeToggle variant="sidebar" />
    </div>
  );

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
      <DiaryBook sidebar={sidebar}>
        <EntriesTab isAdmin={Boolean(user)} />
      </DiaryBook>
      <footer style={{ marginTop: '24px', marginBottom: '32px', textAlign: 'center', maxWidth: '640px', padding: '0 16px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <strong>Shine Journal</strong> &bull; Buku Catatan Harian Pribadi Digital &bull; Simpan kenangan, pantau mood harian, dan kelola cerita Anda dengan aman.
        </p>
      </footer>
    </main>
  );
}
