import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shinejournals.vercel.app';
  let lastModified = new Date();

  try {
    const res = await query('SELECT MAX(created_at) as latest FROM diary_entries');
    if (res.rows[0]?.latest) {
      lastModified = new Date(res.rows[0].latest);
    }
  } catch (err) {
    // Graceful fallback if database connection is deferred at build time
    lastModified = new Date();
  }

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
}
