import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";

// 페이지별로 Layout 유무 설정할 수 있도록 하기 위함
import type { ReactElement, ReactNode } from "react";
import type {NextPage } from "next";

// Layout 커스터마이징을 위한 타입 정의
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  // getLayout이 정의되어 있으면 그거 사용, 아니면 기본 Layout 적용
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <QueryClientProvider client={queryClient}>
      {getLayout(<Component {...pageProps} />)}
    </QueryClientProvider>
  );
}
