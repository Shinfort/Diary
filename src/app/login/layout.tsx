import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login Administrator',
  description: 'Halaman autentikasi khusus administrator dan pemilik buku harian Shine Journal.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
