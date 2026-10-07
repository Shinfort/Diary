"use client";

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { KuromiIcon, MikuIcon } from './KuromiMikuCharacters';
import { Sparkles, Heart, Music } from 'lucide-react';

const QUOTES = [
  { speaker: 'Kuromi', text: 'Tulis ceritamu hari ini dengan jujur dan berani! 🖤💜' },
  { speaker: 'Miku', text: 'Setiap harimu adalah melodi indah yang pantas dikenang! 🎵✨' },
  { speaker: 'Kuromi', text: 'Mau rahasia? Diary ini tempat paling aman untukmu! 🤫' },
  { speaker: 'Miku', text: 'Semangat terus ya! Aku dan Kuromi selalu mendukungmu! 💖' },
];

export default function KuromiMikuBanner() {
  const { isKuromiMiku } = useTheme();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  if (!isKuromiMiku) return null;

  const currentQuote = QUOTES[quoteIndex];

  const handleNextQuote = () => {
    setBouncing(true);
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    setTimeout(() => setBouncing(false), 400);
  };

  return (
    <div
      onClick={handleNextQuote}
      title="Klik untuk mendengar pesan dari Kuromi & Miku!"
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(236, 72, 153, 0.15) 100%)',
        border: '1.5px solid #e9d5ff',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(236, 72, 153, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.08)';
      }}
    >
      {/* Background cute icons */}
      <div
        style={{
          position: 'absolute',
          right: '8px',
          top: '4px',
          opacity: 0.2,
          pointerEvents: 'none',
          display: 'flex',
          gap: '4px',
        }}
      >
        <Sparkles size={16} color="#ec4899" />
        <Music size={14} color="#7c3aed" />
      </div>

      {/* Mascot Avatars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '-6px', flexShrink: 0 }}>
        <div style={{ transform: bouncing ? 'scale(1.15) rotate(-5deg)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
          <KuromiIcon size={42} />
        </div>
        <div style={{ marginLeft: '-8px', transform: bouncing ? 'scale(1.15) rotate(5deg)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
          <MikuIcon size={42} />
        </div>
      </div>

      {/* Speech Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
            }}
          >
            {currentQuote.speaker} ✨
          </span>
          <span style={{ fontSize: '0.65rem', color: '#a855f7', opacity: 0.8 }}>(klik pesan)</span>
        </div>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#4c1d95',
            lineHeight: '1.35',
            fontWeight: '600',
            margin: 0,
          }}
        >
          {currentQuote.text}
        </p>
      </div>
    </div>
  );
}
