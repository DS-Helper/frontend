"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUserStore } from "@/lib/store/userStore";
import { setCookie } from "@/lib/utils/cookies";

export default function KakaoLoginPage() {
  const router = useRouter();
  const { setIsVerified } = useUserStore();

  useEffect(() => {
    // URL에서 authorization code 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('카카오 로그인 에러:', error);
      alert('카카오 로그인에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code) {
      handleKakaoLogin(code);
    } else {
      // code가 없으면 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [router]);

  const handleKakaoLogin = async (code: string) => {
    try {
      console.log('카카오 로그인 처리 시작, code:', code);
      
      // 카카오 로그인 API 호출
      const response = await fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log('API 응답:', data);

      if (response.ok && data.token) {
        // 토큰을 쿠키에 저장
        setCookie('token', data.token, 7);
        
        // 사용자 정보 저장
        if (data.user) {
          const { setUser } = useUserStore.getState();
          setUser(data.user);
        }
        
        // 인증 상태 업데이트
        setIsVerified(true);
        
        alert('카카오 로그인 성공!');
        router.push('/');
      } else {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
      router.push('/login');
    }
  };

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
