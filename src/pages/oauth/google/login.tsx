"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useUserStore, applyLoginResponseTokens } from "@/lib/store/userStore";
import { googleLogin } from "@/lib/apis/authUser";

export default function GoogleLoginPage() {
  const router = useRouter();
  const { setIsVerified } = useUserStore();

  const handleGoogleLogin = useCallback(async (code: string) => {
    try {
      const response = await googleLogin({ code });
      
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
        alert("구글 로그인 성공!");
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
    // URL에서 authorization code 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      alert('구글 로그인에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code) {
      alert(`code: ${code}`);
      handleGoogleLogin(code);
    } else {
      alert('인가 코드(code)가 없습니다.');
      router.push('/login');
    }
  }, [router, handleGoogleLogin]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      구글 로그인 처리 중...
    </div>
  );
}
