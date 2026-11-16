 import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://swiftlineholdings.com';

  const routes = [
    '',
    '/login',
    '/dashboard',
    '/dashboard/book-qc',
    '/dashboard/inventory',
    '/dashboard/tracker',
    '/dashboard/support',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}