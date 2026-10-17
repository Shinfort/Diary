"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apa itu Shine Journal?',
    answer: 'Shine Journal adalah buku catatan harian digital (online personal diary book) interaktif dengan konsep desain buku fisik realistis. Website ini menyajikan linimasa tulisan kenangan, galeri foto & video, serta pelacak suasana hati (mood tracker) yang rapi dan nyaman dibaca.',
  },
  {
    question: 'Bagaimana cara menyaring cerita berdasarkan suasana hati (Mood)?',
    answer: 'Pada linimasa catatan di atas, Anda dapat memilih filter suasana hati seperti Happy (😊 Senang), Peaceful (😌 Tenang), Excited (🤩 Bersemangat), Sad (😢 Sedih), atau Angry (😡 Kesal) untuk menemukan kenangan tertentu.',
  },
  {
    question: 'Apakah Shine Journal dapat diakses di HP Android dan iPhone?',
    answer: 'Tentu saja! Shine Journal dirancang responsif untuk segala ukuran layar, baik smartphone, tablet, maupun laptop. Anda juga dapat menyematkannya ke layar utama (PWA) agar terasa seperti aplikasi buku harian bawaan.',
  },
  {
    question: 'Apakah pengunjung umum perlu mendaftar untuk membaca catatan?',
    answer: 'Tidak perlu. Pengunjung umum dapat langsung menikmati dan membaca seluruh linimasa cerita publik di beranda tanpa perlu login ataupun mendaftar akun.',
  },
  {
    question: 'Bagaimana sistem keamanan siber di Shine Journal?',
    answer: 'Situs ini menerapkan proteksi siber standar OWASP, termasuk enkripsi kata sandi bcrypt, token JWT aman berbasis HTTP-only cookies, pencegahan serangan brute force (Rate Limiting), serta perlindungan header anti-clickjacking.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      aria-label="FAQ & Informasi Buku Harian" 
      style={{ 
        width: '100%', 
        maxWidth: '800px', 
        marginTop: '36px', 
        marginBottom: '24px',
        padding: '0 8px',
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '16px',
          border: '1px solid var(--border, #e5e0d8)',
          boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light, #e8f5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent, #2d6a4f)',
          }}>
            <HelpCircle size={18} />
          </div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            color: 'var(--foreground, #1c1917)',
            fontFamily: 'var(--font-reading)',
            margin: 0,
          }}>
            Tentang Shine Journal &amp; Tanya Jawab (FAQ)
          </h2>
        </div>

        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted, #78716c)', 
          lineHeight: '1.5',
          marginBottom: '20px',
        }}>
          Buku harian online estetik dan ruang digital yang nyaman untuk membaca tulisan kenangan dan melacak suasana hati harian.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                style={{
                  border: '1px solid var(--border, #e5e0d8)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: isOpen ? 'var(--background, #faf7f2)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: '12px',
                  }}
                >
                  <span style={{ 
                    fontSize: '0.92rem', 
                    fontWeight: '700', 
                    color: 'var(--foreground, #1c1917)',
                    fontFamily: 'var(--font-reading)',
                  }}>
                    {item.question}
                  </span>
                  <ChevronDown 
                    size={18} 
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: 'var(--accent, #2d6a4f)',
                      flexShrink: 0,
                    }} 
                  />
                </button>

                {isOpen && (
                  <div style={{ 
                    padding: '0 18px 16px 18px', 
                    fontSize: '0.86rem', 
                    color: 'var(--text-muted, #57534e)',
                    lineHeight: '1.6',
                    fontFamily: 'var(--font-reading)',
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SEO Badges */}
        <div style={{ 
          marginTop: '22px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border, #e5e0d8)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #78716c)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <Sparkles size={13} style={{ color: 'var(--accent, #2d6a4f)' }} /> Sorotan Fitur:
          </span>
          <span style={{ background: 'var(--accent-light, #e8f5e9)', color: 'var(--accent, #2d6a4f)', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
            Buku Diary Digital
          </span>
          <span style={{ background: 'var(--accent-light, #e8f5e9)', color: 'var(--accent, #2d6a4f)', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
            Mood Tracker
          </span>
          <span style={{ background: 'var(--accent-light, #e8f5e9)', color: 'var(--accent, #2d6a4f)', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
            Galeri Memori Foto &amp; Video
          </span>
          <span style={{ background: 'var(--accent-light, #e8f5e9)', color: 'var(--accent, #2d6a4f)', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
            Aman &amp; Terenkripsi
          </span>
        </div>
      </div>
    </section>
  );
}
