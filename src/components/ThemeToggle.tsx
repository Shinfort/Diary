"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles, Palette } from 'lucide-react';
import { KuromiIcon, MikuIcon } from './KuromiMikuCharacters';

export default function ThemeToggle({ variant = 'sidebar' }: { variant?: 'sidebar' | 'pill' }) {
  const { theme, setTheme, isKuromiMiku } = useTheme();

  if (variant === 'pill') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '30px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => setTheme('classic')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: theme === 'classic' ? '700' : '500',
            backgroundColor: theme === 'classic' ? 'var(--primary)' : 'transparent',
            color: theme === 'classic' ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          🌿 Klasik
        </button>
        <button
          type="button"
          onClick={() => setTheme('kuromi-miku')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: theme === 'kuromi-miku' ? '700' : '500',
            background: theme === 'kuromi-miku' ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'transparent',
            color: theme === 'kuromi-miku' ? '#ffffff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
            <KuromiIcon size={16} />
            <MikuIcon size={16} />
          </span>
          Kuromi & Miku
        </button>
      </div>
    );
  }

  // Sidebar card variant
  return (
    <div
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        backgroundColor: isKuromiMiku ? 'rgba(236, 72, 153, 0.08)' : 'var(--accent-light)',
        border: `1px solid ${isKuromiMiku ? '#f3d5f8' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: isKuromiMiku ? '#7c3aed' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <Palette size={13} /> Tema Tampilan
        </span>
        {isKuromiMiku && (
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: '#ec4899',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Sparkles size={10} /> Aktif
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {/* Button Klasik */}
        <button
          type="button"
          onClick={() => setTheme('classic')}
          style={{
            padding: '7px 8px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: theme === 'classic' ? '700' : '500',
            backgroundColor: theme === 'classic' ? 'var(--primary)' : 'var(--card-bg)',
            color: theme === 'classic' ? '#ffffff' : 'var(--text-muted)',
            border: `1px solid ${theme === 'classic' ? 'transparent' : 'var(--border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
          }}
        >
          🌿 Klasik
        </button>

        {/* Button Kuromi & Miku */}
        <button
          type="button"
          onClick={() => setTheme('kuromi-miku')}
          style={{
            padding: '7px 8px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: theme === 'kuromi-miku' ? '700' : '500',
            background: theme === 'kuromi-miku' 
              ? 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' 
              : 'var(--card-bg)',
            color: theme === 'kuromi-miku' ? '#ffffff' : 'var(--foreground)',
            border: `1px solid ${theme === 'kuromi-miku' ? 'transparent' : '#e9d5ff'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            boxShadow: theme === 'kuromi-miku' ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
          }}
        >
          <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
            <KuromiIcon size={14} />
            <MikuIcon size={14} />
          </span>
          Kuromi & Miku
        </button>
      </div>
    </div>
  );
}
