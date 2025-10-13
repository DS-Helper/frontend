import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { useUserStore } from "@/lib/store/userStore";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { checkAuthStatus } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서 하이드레이션 완료 후 인증 상태 확인
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // 하이드레이션이 완료된 후에만 인증 상태 확인
    if (isHydrated) {
      checkAuthStatus();
    }
  }, [isHydrated, checkAuthStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </QueryClientProvider>
  );
}
