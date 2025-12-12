import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 기본 META 태그 */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* SEO 기본 정보 */}
        <meta name="description" content="달성군 이웃을 위한 무료 방문 서비스 디에스헬퍼. 생활 돌봄, 정서적 돌봄, 아이돌봄, 청년/성인 대상 지원, 기관/단체 대상 지원 등 다양한 봉사 활동을 제공합니다." />
        <meta name="keywords" content="디에스헬퍼, 달성군, 봉사, dshelepr, DS Helper, 달성군 봉사, 무료 방문 서비스, 생활 돌봄, 정서적 돌봄, 아이돌봄, 청년 지원, 기관 지원" />
        <meta name="author" content="디에스헬퍼" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph 태그 (SNS 공유용) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="디에스헬퍼 - 달성군 이웃을 위한 무료 방문 서비스" />
        <meta property="og:description" content="달성군 이웃을 위한 무료 방문 서비스 디에스헬퍼. 생활 돌봄, 정서적 돌봄, 아이돌봄 등 다양한 봉사 활동을 제공합니다." />
        <meta property="og:site_name" content="디에스헬퍼" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* Twitter Card 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="디에스헬퍼 - 달성군 이웃을 위한 무료 방문 서비스" />
        <meta name="twitter:description" content="달성군 이웃을 위한 무료 방문 서비스 디에스헬퍼. 생활 돌봄, 정서적 돌봄, 아이돌봄 등 다양한 봉사 활동을 제공합니다." />
        
        {/* 검색 엔진 인증 */}
        <meta name="google-site-verification" content="b7oOKTY7k-qg3A4gkXUCFsBVTQXE8zyUidmQSmvLiMI" />
        <meta name="naver-site-verification" content="4eb1187d35e1ff152099ee3a80d8b0da0783c803" />
        
        {/* 추가 SEO 태그 */}
        <meta name="theme-color" content="#0DBA53" />
        <link rel="canonical" href="https://www.dshelper.kr/" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
