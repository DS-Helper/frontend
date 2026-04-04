"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useUserStore, applyLoginResponseTokens } from "@/lib/store/userStore";
import { naverLogin } from "@/lib/apis/authUser";

export default function NaverLoginPage() {
  const router = useRouter();
  const { setIsVerified } = useUserStore();

  const handleNaverLogin = useCallback(async (code: string, state: string) => {
    try {
      // naverLogin API 호출 (code와 state를 파라미터로 전달)
      const response = await naverLogin({ code, state });
      
      if (response && response.data) {
        const data = response.data;
        
        applyLoginResponseTokens(data);
        const { accessToken, refreshToken } = useUserStore.getState();
        if (!accessToken && !refreshToken) {
          throw new Error(data.message || "로그인에 실패했습니다.");
        }
        if (data.user) {
          const { setUser, setUserType } = useUserStore.getState();
          setUser(data.user);
          setUserType("individual");
        }
        setIsVerified(true);
        alert("네이버 로그인 성공!");
        router.push("/");
      } else {
        throw new Error('로그인 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
      router.push('/login');
    }
  }, [router, setIsVerified]);

  useEffect(() => {
    // URL에서 authorization code와 state 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      alert('네이버 로그인에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code && state) {
      handleNaverLogin(code, state);
    } else {
      // code나 state가 없으면 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [router, handleNaverLogin]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      네이버 로그인 처리 중...
    </div>
  );
}

