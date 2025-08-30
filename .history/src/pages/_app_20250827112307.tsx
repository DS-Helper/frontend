import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { AppProps } from "next/app";
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </QueryClientProvider>
  );
}
