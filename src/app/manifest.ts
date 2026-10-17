import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shine Journal - Buku Catatan Harian Pribadi',
    short_name: 'Shine Journal',
    description: 'Buku catatan harian pribadi online interaktif dengan galeri foto, mood tracker, dan catatan keuangan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#2d6a4f',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
