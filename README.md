This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# 카카오 로그인 설정
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_ID=your_kakao_client_id_here

# 카카오 리다이렉트 URI 설정
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:8080/oauth/kakao/login
KAKAO_REDIRECT_URI=http://localhost:8080/oauth/kakao/login

# 프로덕션 환경에서는 다음과 같이 설정하세요:
# NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://www.dshelper.kro.kr/oauth/kakao/login
# KAKAO_REDIRECT_URI=https://www.dshelper.kro.kr/oauth/kakao/login

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 후 Client ID 확인
3. 플랫폼 설정에서 Web 플랫폼 추가
4. Redirect URI 설정:
   - 개발: `http://localhost:8080/oauth/kakao/login`
   - 프로덕션: `https://www.dshelper.kro.kr/oauth/kakao/login`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
