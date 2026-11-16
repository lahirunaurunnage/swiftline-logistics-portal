
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://swiftlineholdings.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  } as any;
}