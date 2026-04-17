"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../../components/oauth/OAuthCallbackLayout.module.scss";

/**
 * 예전 redirect URI(`/oauth/kakao/login`)로 돌아오는 요청을 `/kakao/callback`으로 넘깁니다.
 */
export default function KakaoLoginLegacyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    console.log("[kakao legacy login-url] asPath", router.asPath);
    const qIndex = router.asPath.indexOf("?");
    const query = qIndex >= 0 ? router.asPath.slice(qIndex) : "";
    console.log("[kakao legacy login-url] redirectQuery", query);

    void router.replace(`/kakao/callback${query}`);
  }, [router.isReady, router.asPath, router]);

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>로그인 처리 페이지로 이동 중…</p>
    </div>
  );
}
