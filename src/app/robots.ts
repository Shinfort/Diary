import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shinejournals.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/admin/*', '/api/*', '/verify*', '/login'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin', '/admin/*', '/api/*', '/verify*', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
