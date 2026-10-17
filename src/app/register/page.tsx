"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <p style={{ color: 'var(--text-muted, #666)' }}>Pendaftaran publik ditutup. Mengalihkan ke beranda...</p>
    </div>
  );
}
