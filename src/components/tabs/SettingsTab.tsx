"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, UserCheck, Mail, ShieldCheck } from 'lucide-react';

export default function SettingsTab({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);

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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <Settings size={24} style={{ color: 'var(--accent)' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)' }}>
          Pengaturan Akun
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> <strong>Hak Akses:</strong> {user?.role === 'admin' ? 'Administrator' : 'Pengguna Terdaftar'}
            </p>
          </div>
        </div>

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
