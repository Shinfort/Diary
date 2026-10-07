"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, UserCheck, Mail, ShieldCheck, HardDrive, CheckCircle, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { KuromiIcon, MikuIcon } from '@/components/KuromiMikuCharacters';

export default function SettingsTab({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<{ 
    id: number; 
    name: string; 
    email: string; 
    role: string; 
    storage_limit_bytes?: number; 
    storage_used_bytes?: number; 
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error("Failed to fetch user session", e);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
      router.push('/login');
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const usedBytes = user?.storage_used_bytes || 0;
  const limitBytes = user?.storage_limit_bytes || 5368709120; // 5 GB default
  const usedPercentage = Math.min(100, Math.max(0, (usedBytes / limitBytes) * 100));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <Settings size={24} style={{ color: 'var(--accent)' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)' }}>
          Pengaturan Akun
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Info Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={18} style={{ color: 'var(--accent)' }} /> Informasi Akun
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '1rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Nama:</strong> {user?.name || 'Pengguna'}
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} /> <strong>Email:</strong> {user?.email || '-'}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> <strong>Hak Akses:</strong> {user?.role === 'admin' ? 'Administrator' : 'Pengguna Terverifikasi'}
            </p>
          </div>
        </div>

        {/* Theme Customization Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} style={{ color: 'var(--accent)' }} /> Tema Tampilan Jurnal
            </h3>
            {theme === 'kuromi-miku' && (
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ec4899', backgroundColor: '#fce7f3', padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Kuromi & Miku Aktif
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Pilih nuansa warna tampilan jurnal harian sesuai dengan suasana hatimu.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Theme 1: Klasik */}
            <div
              onClick={() => setTheme('classic')}
              style={{
                border: `2px solid ${theme === 'classic' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: theme === 'classic' ? 'rgba(45, 106, 79, 0.04)' : 'var(--card-bg)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌿</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--foreground)' }}>Tema Klasik</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default warm paper</span>
                  </div>
                </div>
                {theme === 'classic' && <CheckCircle size={18} style={{ color: 'var(--accent)' }} />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                Palet kertas hangat minimalis berpadu aksen hijau daun yang tenang.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fcfbf9', border: '1px solid #dcdad6' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1a1a1a' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2d6a4f' }} />
              </div>
            </div>

            {/* Theme 2: Kuromi & Miku */}
            <div
              onClick={() => setTheme('kuromi-miku')}
              style={{
                border: `2px solid ${theme === 'kuromi-miku' ? '#ec4899' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: theme === 'kuromi-miku' ? 'rgba(236, 72, 153, 0.05)' : 'var(--card-bg)',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: theme === 'kuromi-miku' ? '0 4px 16px rgba(124, 58, 237, 0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KuromiIcon size={26} />
                  <MikuIcon size={26} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: theme === 'kuromi-miku' ? '#7c3aed' : 'var(--foreground)' }}>
                      Kuromi & Miku
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: '600' }}>Ungu & Pink Ceria</span>
                  </div>
                </div>
                {theme === 'kuromi-miku' && <CheckCircle size={18} style={{ color: '#ec4899' }} />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                Nuansa ungu lavender dengan sentuhan pink manis serta karakter Kuromi 🖤 & Hatsune Miku 🎵!
              </p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#faf5ff', border: '1px solid #edd5f8' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
                <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: '600', marginLeft: '4px' }}>✨ Edisi Spesial</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5GB Storage Quota Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={18} style={{ color: 'var(--accent)' }} /> Kuota Penyimpanan (5.0 GB)
            </h3>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>
              {formatStorage(usedBytes)} / {formatStorage(limitBytes)} ({usedPercentage.toFixed(1)}%)
            </span>
          </div>

          {/* Storage Progress Bar */}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'var(--border)',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              width: `${Math.max(1, usedPercentage)}%`,
              height: '100%',
              backgroundColor: usedPercentage > 90 ? '#ef4444' : 'var(--accent)',
              borderRadius: '5px',
              transition: 'width 0.4s ease',
            }} />
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Setiap akun di Personal Diary memiliki kuota penyimpanan minimal <strong>5 GB</strong> untuk menyimpan catatan teks, galeri foto beresolusi tinggi, dan video kenangan.
          </p>
        </div>

        {/* Logout Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--foreground)' }}>
            Keluar Sesi (Logout)
          </h3>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '12px 24px', 
              fontSize: '0.95rem', 
              fontWeight: '600',
              backgroundColor: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <LogOut size={16} /> Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}
