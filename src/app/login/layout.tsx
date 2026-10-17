import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk / Daftar Akun',
  description: 'Masuk ke buku harian pribadi Shine Journal Anda untuk mulai menulis cerita, mengunggah foto, dan mengelola catatan harian Anda.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
