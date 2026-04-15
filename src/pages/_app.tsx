import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { useUserStore } from "@/lib/store/userStore";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { checkAuthStatus } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서 하이드레이션 완료 후 인증 상태 확인
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // 하이드레이션이 완료되고 아직 인증 확인을 하지 않았을 때만 확인
    if (isHydrated && !hasCheckedAuth) {
      checkAuthStatus();
      setHasCheckedAuth(true);
    }
  }, [isHydrated, hasCheckedAuth, checkAuthStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>디에스헬퍼 - 달성군 이웃을 위한 무료 방문 서비스</title>
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </QueryClientProvider>
  );
}
