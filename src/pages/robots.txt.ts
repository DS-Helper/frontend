import { GetServerSideProps } from 'next';

const SITE_URL = 'https://www.dshelper.kr/';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /oauth/
Disallow: /cms/
Disallow: /_next/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
};

// 기본 export는 필요 없지만 Next.js가 요구할 수 있음
export default function Robots() {
  return null;
}

