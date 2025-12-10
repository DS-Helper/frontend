import { GetServerSideProps } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dshelper.kro.kr';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemap(urls: SitemapUrl[]): string {
  const urlsXml = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const currentDate = new Date().toISOString().split('T')[0];

  // 정적 페이지 목록
  const staticPages: SitemapUrl[] = [
    {
      loc: `${SITE_URL}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${SITE_URL}/help`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      loc: `${SITE_URL}/helpList`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      loc: `${SITE_URL}/helpStory`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      loc: `${SITE_URL}/login`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${SITE_URL}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      loc: `${SITE_URL}/terms`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      loc: `${SITE_URL}/customer`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7,
    },
  ];

  const sitemap = generateSitemap(staticPages);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

// 기본 export는 필요 없지만 Next.js가 요구할 수 있음
export default function Sitemap() {
  return null;
}

