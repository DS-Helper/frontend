import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import NotificationListModal from "@/components/Modal/NotificationListModal";
import { useUserStore } from "@/lib/store/userStore";
import {
  getMyIdentifier,
  parseMyIdentifierUserId,
  parseMyIdentifierUserRole,
} from "@/lib/apis/account";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { checkAuthStatus, setUserId, setUserRole } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // 알림 모달 상태
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNotificationModalClosing, setIsNotificationModalClosing] = useState(false);
  const [isNotificationModalOpening, setIsNotificationModalOpening] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서 하이드레이션 완료 후 인증 상태 확인
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // 하이드레이션이 완료되고 아직 인증 확인을 하지 않았을 때만 확인
    if (isHydrated && !hasCheckedAuth) {
      void (async () => {
        try {
          await checkAuthStatus();
          const { isVerified } = useUserStore.getState();
          if (!isVerified) return;
          const myIdentifierRes = await getMyIdentifier();
          const nextUserId = parseMyIdentifierUserId(myIdentifierRes?.data ?? null);
          const nextUserRole = parseMyIdentifierUserRole(myIdentifierRes?.data ?? null);
          if (nextUserId) setUserId(nextUserId);
          if (nextUserRole) setUserRole(nextUserRole);
        } catch (error) {
          // 비로그인 상태에서는 자연스럽게 실패할 수 있어 조용히 무시
          console.debug("[auth] getMyIdentifier skipped:", error);
        }
      })();
      setHasCheckedAuth(true);
    }
  }, [isHydrated, hasCheckedAuth, checkAuthStatus, setUserId, setUserRole]);

  // 알림 모달 열기 이벤트 리스너 (모든 페이지에서 작동)
  useEffect(() => {
    const handleOpenNotificationModal = () => {
      setIsNotificationModalOpen(true);
      setTimeout(() => {
        setIsNotificationModalOpening(true);
      }, 10);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openNotificationModal', handleOpenNotificationModal);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openNotificationModal', handleOpenNotificationModal);
      }
    };
  }, []);

  useEffect(() => {
    const applyNoHistoryAttrs = (root: ParentNode) => {
      root.querySelectorAll("form").forEach((el) => {
        el.setAttribute("autocomplete", "off");
      });
      root.querySelectorAll("input, textarea").forEach((el) => {
        const node = el as HTMLInputElement | HTMLTextAreaElement;
        node.setAttribute("autocomplete", "off");
        node.setAttribute("autocapitalize", "off");
        node.setAttribute("autocorrect", "off");
        node.setAttribute("spellcheck", "false");
      });
    };

    applyNoHistoryAttrs(document);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((added) => {
          if (!(added instanceof HTMLElement)) return;
          if (added.matches("form, input, textarea")) {
            applyNoHistoryAttrs(added.parentElement ?? document);
          } else {
            applyNoHistoryAttrs(added);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // 알림 모달 닫기 핸들러
  const handleCloseNotificationModal = () => {
    setIsNotificationModalClosing(true);
    setIsNotificationModalOpening(false);
    
    setTimeout(() => {
      setIsNotificationModalOpen(false);
      setIsNotificationModalClosing(false);
      setIsNotificationModalOpening(false);
    }, 300);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>디에스헬퍼 - 달성군 이웃을 위한 무료 방문 서비스</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
      
      {/* 알림 모달 - 모든 페이지에서 작동 */}
      <NotificationListModal
        isOpen={isNotificationModalOpen}
        isClosing={isNotificationModalClosing}
        isOpening={isNotificationModalOpening}
        onClose={handleCloseNotificationModal}
      />
    </QueryClientProvider>
  );
}
