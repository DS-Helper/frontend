"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { getLogin } from "@/lib/apis/authUser";
import { useUserStore, applyLoginResponseTokens } from "@/lib/store/userStore";
import type { User } from "@/types/userType";
import { parseOAuthCallbackUrl } from "@/lib/oauth/parseOAuthCallbackUrl";
import styles from "./KakaoCallback.module.scss";

const kakaoOAuthAttempted = new Set<string>();

export default function KakaoCallback() {
  const router = useRouter();
  const { setIsVerified } = useUserStore();

  const completeLogin = useCallback(
    async (code: string) => {
      try {
        const response = await getLogin(code);

        if (!response?.data) {
          throw new Error("로그인 요청에 실패했습니다.");
        }

        const data = response.data as {
          accessToken?: string;
          refreshToken?: string;
          data?: { accessToken?: string; refreshToken?: string };
          token?: string;
          user?: User;
          message?: string;
        };

        applyLoginResponseTokens(data);

        const { accessToken, refreshToken } = useUserStore.getState();
        if (!accessToken && !refreshToken) {
          throw new Error(
            data.message || "응답에 accessToken·refreshToken이 없습니다."
          );
        }

        if (data.user) {
          const { setUser, setUserType } = useUserStore.getState();
          setUser(data.user);
          setUserType("individual");
        }

        setIsVerified(true);
        await router.replace("/");
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "로그인 처리 중 오류가 발생했습니다.";
        alert(message);
        await router.replace("/login");
      }
    },
    [router, setIsVerified]
  );

  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    const { code, error, errorDescription } = parseOAuthCallbackUrl(
      window.location.href
    );

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
    alert(`카카오 인가 code:\n${code}`);
    void completeLogin(code);
  }, [router.isReady, router, completeLogin]);

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>카카오 로그인 처리 중…</p>
    </div>
  );
}
