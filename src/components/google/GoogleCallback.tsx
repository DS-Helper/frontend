"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { googleLogin } from "@/lib/apis/authUser";
import { parseOAuthCallbackUrl } from "@/lib/oauth/parseOAuthCallbackUrl";
import { completeIndividualSnsLogin } from "@/lib/oauth/completeIndividualSnsLogin";
import styles from "../oauth/OAuthCallbackLayout.module.scss";

const googleOAuthAttempted = new Set<string>();

export default function GoogleCallback() {
  const router = useRouter();

  const completeLogin = useCallback(
    async (code: string) => {
      try {
        const response = await googleLogin({ code });
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

    const { code, error, errorDescription } = parseOAuthCallbackUrl(
      window.location.href
    );

    if (error) {
      alert(
        errorDescription?.trim()
          ? `구글 로그인 실패: ${errorDescription}`
          : "구글 로그인에 실패했습니다."
      );
      void router.replace("/login");
      return;
    }

    if (!code) {
      alert("인가 코드(code)가 없습니다.");
      void router.replace("/login");
      return;
    }

    if (googleOAuthAttempted.has(code)) return;
    googleOAuthAttempted.add(code);
    void completeLogin(code);
  }, [router.isReady, router, completeLogin]);

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>구글 로그인 처리 중…</p>
    </div>
  );
}
