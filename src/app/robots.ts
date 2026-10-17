import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shinejournals.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/admin', '/admin/*', '/api/*', '/verify*'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/login'],
        disallow: ['/admin', '/admin/*', '/api/*', '/verify*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
