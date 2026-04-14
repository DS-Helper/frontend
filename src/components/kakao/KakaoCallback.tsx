"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { getLogin } from "@/lib/apis/authUser";
import { parseOAuthCallbackUrl } from "@/lib/oauth/parseOAuthCallbackUrl";
import { completeIndividualSnsLogin } from "@/lib/oauth/completeIndividualSnsLogin";
import styles from "@/components/oauth/OAuthCallbackLayout.module.scss";

const kakaoOAuthAttempted = new Set<string>();

export default function KakaoCallback() {
  const router = useRouter();

  const completeLogin = useCallback(
    async (code: string) => {
      try {
        console.log("[kakao callback] login request code", code);
        const response = await getLogin(code);
        if (!response?.data) {
          throw new Error("로그인 요청에 실패했습니다.");
        }
        await completeIndividualSnsLogin(router, response.data);
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error
            ? error.message
            : "로그인 처리 중 오류가 발생했습니다.";
        alert(message);
        await router.replace("/login");
      }
    },
    [router]
  );

  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;
    console.log("[kakao callback] href", window.location.href);

    const { code, error, errorDescription } = parseOAuthCallbackUrl(
      window.location.href
    );
    console.log("[kakao callback] parsed", { code, error, errorDescription });

    if (error) {
      alert(
        errorDescription?.trim()
          ? `카카오 로그인 실패: ${errorDescription}`
          : "카카오 로그인에 실패했습니다."
      );
      void router.replace("/login");
      return;
    }

    if (!code) {
      alert("인가 코드(code)가 없습니다.");
      void router.replace("/login");
      return;
    }

    if (kakaoOAuthAttempted.has(code)) return;
    kakaoOAuthAttempted.add(code);

    console.log("[kakao callback] OAuth code (before POST /oauth/kakao/login)", code);
    alert(code);

    void completeLogin(code);
  }, [router.isReady, router, completeLogin]);

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>카카오 로그인 처리 중…</p>
    </div>
  );
}
