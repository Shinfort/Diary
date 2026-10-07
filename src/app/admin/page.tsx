"use client";

import { useState, useEffect } from 'react';
import DiaryBook from '@/components/DiaryBook';
import EntriesTab from '@/components/tabs/EntriesTab';
import WriteTab from '@/components/tabs/WriteTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import FinanceTab from '@/components/tabs/FinanceTab';
import { BookOpen, PenTool, Settings, Wallet, UserCheck, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'entries' | 'write' | 'finance' | 'settings'>('entries');
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    }
    loadUser();
  }, []);

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          {user?.role === 'admin' ? <Shield size={22} /> : <UserCheck size={22} />}
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            {user?.name || 'Dashboard'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email || 'Jurnal & Keuangan'}
          </p>
        </div>
      </div>

      <nav style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button 
          onClick={() => setActiveTab('entries')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'entries' ? 'white' : 'var(--text-muted)',
            backgroundColor: activeTab === 'entries' ? 'var(--primary)' : 'transparent',
            fontWeight: '600',
            fontSize: '0.9rem',
            textAlign: 'left',
            border: 'none',
          }}
        >
          <BookOpen size={16} /> Linimasa Catatan
        </button>
        
        <button 
          onClick={() => setActiveTab('write')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'write' ? 'white' : 'var(--text-muted)',
            backgroundColor: activeTab === 'write' ? 'var(--primary)' : 'transparent',
            fontWeight: '600',
            fontSize: '0.9rem',
            textAlign: 'left',
            border: 'none',
          }}
        >
          <PenTool size={16} /> Tulis Catatan
        </button>

        <button 
          onClick={() => setActiveTab('finance')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'finance' ? 'white' : 'var(--text-muted)',
            backgroundColor: activeTab === 'finance' ? 'var(--primary)' : 'transparent',
            fontWeight: '600',
            fontSize: '0.9rem',
            textAlign: 'left',
            border: 'none',
          }}
        >
          <Wallet size={16} /> Catatan Keuangan
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: activeTab === 'settings' ? 'white' : 'var(--text-muted)',
            backgroundColor: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
            fontWeight: '600',
            fontSize: '0.9rem',
            textAlign: 'left',
            border: 'none',
          }}
        >
          <Settings size={16} /> Pengaturan Akun
        </button>
      </nav>
    </div>
  );

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
      <DiaryBook sidebar={sidebar}>
        {activeTab === 'entries' && <EntriesTab isAdmin={true} />}
        {activeTab === 'write' && (
          <WriteTab 
            onSaveSuccess={() => setActiveTab('entries')} 
          />
        )}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'settings' && <SettingsTab isAdmin={true} />}
      </DiaryBook>
    </main>
  );
}
