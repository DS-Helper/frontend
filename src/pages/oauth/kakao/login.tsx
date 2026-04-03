"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useUserStore } from "@/lib/store/userStore";
import { getLogin } from "@/lib/apis/authUser";
import type { User } from "@/types/userType";
import { extractOAuthCodeAsAccessToken } from "@/lib/oauth/extractOAuthCode";

export default function KakaoLoginPage() {
  const router = useRouter();
  const { setIsVerified } = useUserStore();

  const handleKakaoLogin = useCallback(async (code: string) => {
    const { releaseKakaoOAuthCode, setKakaoAccessToken } =
      useUserStore.getState();

    try {
      const response = await getLogin(code);

      if (!response?.data) {
        throw new Error("로그인 요청에 실패했습니다.");
      }

      const data = response.data as {
        accessToken?: string;
        token?: string;
        user?: User;
        message?: string;
      };

      if (data.accessToken) {
        setKakaoAccessToken(data.accessToken);
      }

      if (data.token) {
        if (data.user) {
          const { setUser, setUserType } = useUserStore.getState();
          setUser(data.user);
          setUserType("individual");
        }

        setIsVerified(true);

        alert("카카오 로그인 성공!");
        router.push("/");
      } else if (data.accessToken) {
        alert("카카오 액세스 토큰이 저장되었습니다.");
        router.push("/");
      } else {
        throw new Error(
          data.message || "응답에 accessToken 또는 token이 없습니다."
        );
      }
    } catch (error) {
      console.error("로그인 처리 중 오류:", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
      router.push("/login");
    } finally {
      releaseKakaoOAuthCode(code);
    }
  }, [router, setIsVerified]);

  useEffect(() => {
    const href = window.location.href;
    const code = extractOAuthCodeAsAccessToken(href);
    const error = new URL(href).searchParams.get("error");

    if (error) {
      alert('카카오 로그인에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code) {
      const claimed = useUserStore.getState().claimKakaoOAuthCode(code);
      if (!claimed) return;
      handleKakaoLogin(code);
    } else {
      // code가 없으면 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [router, handleKakaoLogin]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      카카오 로그인 처리 중...
    </div>
  );
}
