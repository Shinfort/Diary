"use client";

import React from 'react';
import styles from './DiaryBook.module.css';

interface DiaryBookProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function DiaryBook({ sidebar, children }: DiaryBookProps) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
      <section className={styles.mainContent}>
        {children}
      </section>
    </div>
  );
}
