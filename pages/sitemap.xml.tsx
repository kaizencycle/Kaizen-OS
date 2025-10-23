import { GetServerSideProps } from 'next';

interface SitemapProps {}

export default function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oaa-api-library.vercel.app';
  
  const staticPages = [
    '/',
    '/ethics',
    '/virtue-accords', 
    '/gic',
    '/civic-ai'
  ];

  const apiEndpoints = [
    '/api/beacons/search',
    '/api/faq/ethics',
    '/api/faq/virtue-accords',
    '/api/faq/gic',
    '/api/faq/civic-ai'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages
    .map((page) => {
      return `
    <url>
      <loc>${baseUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page === '/' ? '1.0' : '0.8'}</priority>
    </url>`;
    })
    .join('')}
  ${apiEndpoints
    .map((endpoint) => {
      return `
    <url>
      <loc>${baseUrl}${endpoint}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.6</priority>
    </url>`;
    })
    .join('')}
  <url>
    <loc>${baseUrl}/public/ai-seo/index.jsonld</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};