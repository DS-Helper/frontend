import "";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import NotificationListModal from "@/components/Modal/NotificationListModal";
import { useUserStore } from "@/lib/store/userStore";
import { getMyIdentifier, parseMyIdentifierUserId } from "@/lib/apis/account";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { checkAuthStatus, setUserId } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // ?Œë¦¼ ëª¨ë‹¬ ?íƒœ
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNotificationModalClosing, setIsNotificationModalClosing] = useState(false);
  const [isNotificationModalOpening, setIsNotificationModalOpening] = useState(false);

  useEffect(() => {
    // ?´ë¼?´ì–¸???¬ì´?œì—???˜ì´?œë ˆ?´ì…˜ ?„ë£Œ ???¸ì¦ ?íƒœ ?•ì¸
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // ?˜ì´?œë ˆ?´ì…˜???„ë£Œ?˜ê³  ?„ì§ ?¸ì¦ ?•ì¸???˜ì? ?Šì•˜???Œë§Œ ?•ì¸
    if (isHydrated && !hasCheckedAuth) {
      void (async () => {
        try {
          await checkAuthStatus();
          const { isVerified } = useUserStore.getState();
          if (!isVerified) return;
          const myIdentifierRes = await getMyIdentifier();
          const nextUserId = parseMyIdentifierUserId(myIdentifierRes?.data ?? null);
          if (nextUserId) setUserId(nextUserId);
        } catch (error) {
          // ë¹„ë¡œê·¸ì¸ ?íƒœ?ì„œ???ì—°?¤ëŸ½ê²??¤íŒ¨?????ˆì–´ ì¡°ìš©??ë¬´ì‹œ
          console.debug("[auth] getMyIdentifier skipped:", error);
        }
      })();
      setHasCheckedAuth(true);
    }
  }, [isHydrated, hasCheckedAuth, checkAuthStatus, setUserId]);

  // ?Œë¦¼ ëª¨ë‹¬ ?´ê¸° ?´ë²¤??ë¦¬ìŠ¤??(ëª¨ë“  ?˜ì´ì§€?ì„œ ?‘ë™)
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

  // ?Œë¦¼ ëª¨ë‹¬ ?«ê¸° ?¸ë“¤??
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
        <title>?”ì—?¤í—¬??- ?¬ì„±êµ??´ì›ƒ???„í•œ ë¬´ë£Œ ë°©ë¬¸ ?œë¹„??/title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
      
      {/* ?Œë¦¼ ëª¨ë‹¬ - ëª¨ë“  ?˜ì´ì§€?ì„œ ?‘ë™ */}
      <NotificationListModal
        isOpen={isNotificationModalOpen}
        isClosing={isNotificationModalClosing}
        isOpening={isNotificationModalOpening}
        onClose={handleCloseNotificationModal}
      />
    </QueryClientProvider>
  );
}
