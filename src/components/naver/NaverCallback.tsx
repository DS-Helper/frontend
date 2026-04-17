"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { naverLogin } from "@/lib/apis/authUser";
import { parseOAuthCallbackUrl } from "@/lib/oauth/parseOAuthCallbackUrl";
import { completeIndividualSnsLogin } from "@/lib/oauth/completeIndividualSnsLogin";
import styles from "../oauth/OAuthCallbackLayout.module.scss";

const naverOAuthAttempted = new Set<string>();

function naverAttemptKey(code: string, state: string) {
  return `${code}\0${state}`;
}

export default function NaverCallback() {
  const router = useRouter();

  const completeLogin = useCallback(
    async (code: string, state: string) => {
      try {
        const response = await naverLogin({ code, state });
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

    const { code, state, error, errorDescription } = parseOAuthCallbackUrl(
      window.location.href
    );

    if (error) {
      alert(
        errorDescription?.trim()
          ? `네이버 로그인 실패: ${errorDescription}`
          : "네이버 로그인에 실패했습니다."
      );
      void router.replace("/login");
      return;
    }

    if (!code || !state) {
      alert("인가 코드(code) 또는 state가 없습니다.");
      void router.replace("/login");
      return;
    }

    const key = naverAttemptKey(code, state);
    if (naverOAuthAttempted.has(key)) return;
    naverOAuthAttempted.add(key);
    void completeLogin(code, state);
  }, [router.isReady, router, completeLogin]);

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>네이버 로그인 처리 중…</p>
    </div>
  );
}
