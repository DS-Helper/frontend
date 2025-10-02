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

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </QueryClientProvider>
  );
}
