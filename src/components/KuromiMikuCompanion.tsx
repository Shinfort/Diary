"use client";

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { KuromiIcon, MikuIcon } from './KuromiMikuCharacters';
import { Heart, Sparkles, X, MessageCircle } from 'lucide-react';

export default function KuromiMikuCompanion() {
  const { isKuromiMiku } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isKuromiMiku || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        pointerEvents: 'auto',
      }}
    >
      {/* Expanded Speech Popover */}
      {isOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e9d5ff',
            borderRadius: '16px',
            padding: '16px',
            width: '280px',
            boxShadow: '0 12px 30px rgba(124, 58, 237, 0.18)',
            position: 'relative',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: '#9ca3af',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Tutup"
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>💜</span>
            <strong style={{ fontSize: '0.9rem', color: '#4c1d95' }}>Kuromi & Miku Diary Space</strong>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#6b21a8', lineHeight: '1.45', margin: 0, marginBottom: '10px' }}>
            Tema favoritmu sedang aktif! Nuansa ungu pastel dengan aksen pink ceria siap menemani setiap catatan dan pembukuan harianmu.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3e8ff', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: '600' }}>
              ✨ Kuromi 🖤 Miku 🎀
            </span>
            <button
              onClick={() => setDismissed(true)}
              style={{
                fontSize: '0.7rem',
                color: '#9ca3af',
                textDecoration: 'underline',
              }}
            >
              Sembunyikan
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button with Kuromi & Miku Avatars */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          padding: '6px 14px 6px 8px',
          borderRadius: '35px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
          border: '2px solid #ffffff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(236, 72, 153, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-2px' }}>
          <div style={{ transform: 'rotate(-4deg)' }}>
            <KuromiIcon size={34} />
          </div>
          <div style={{ marginLeft: '-10px', transform: 'rotate(4deg)' }}>
            <MikuIcon size={34} />
          </div>
        </div>
        <span
          style={{
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.8rem',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Kuromi & Miku <Sparkles size={12} fill="#ffffff" />
        </span>
      </div>
    </div>
  );
}
