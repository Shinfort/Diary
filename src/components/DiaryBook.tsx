"use client";

import React from 'react';
import styles from './DiaryBook.module.css';
import { useTheme } from '@/context/ThemeContext';
import { KuromiIcon, MikuIcon } from './KuromiMikuCharacters';

interface DiaryBookProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function DiaryBook({ sidebar, children }: DiaryBookProps) {
  const { isKuromiMiku } = useTheme();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
      <section
        className={styles.mainContent}
        style={{
          position: 'relative',
          borderTop: isKuromiMiku ? '3px solid #c084fc' : undefined,
        }}
      >
        {isKuromiMiku && (
          <div
            style={{
              position: 'absolute',
              top: '-16px',
              right: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              padding: '2px 10px',
              borderRadius: '20px',
              border: '1.5px solid #e9d5ff',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)',
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            <KuromiIcon size={20} />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Kuromi & Miku Diary
            </span>
            <MikuIcon size={20} />
          </div>
        )}
        {children}
      </section>
    </div>
  );
}
