"use client";

import styles from "../../styles/Login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { MdHome } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getLoginUrl, naverLoginUrl, googleLoginUrl } from "@/lib/apis/authUser";
import { extractOAuthCodeAsAccessToken } from "@/lib/oauth/extractOAuthCode";

const cn = classNames.bind(styles);

// URL이 절대 URL인지 확인하고, 절대 URL로 변환하는 함수
const normalizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // 이미 절대 URL인 경우 (http:// 또는 https://로 시작)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 상대 경로인 경우 (/로 시작)
  if (url.startsWith('/')) {
    return url;
  }

  return url;
};

export default function LoginPage() {
  const router = useRouter();

  /** redirect_uri가 /login 인 경우 — query의 code를 그대로 accessToken으로 쓰는 콜백 경로로 넘김 */
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;
    if (router.pathname !== "/login") return;
    const code = extractOAuthCodeAsAccessToken(window.location.href);
    if (!code) return;
    void router.replace(
      { pathname: "/oauth/kakao/login", query: { code } },
      `/oauth/kakao/login?code=${encodeURIComponent(code)}`
    );
  }, [router.isReady, router.pathname, router.asPath, router]);

  const handleKakaoLogin = async () => {
    try {
      console.log('카카오 로그인 URL 요청 시작');
      
      // getLoginUrl API 호출
      const response = await getLoginUrl();
      
      if (response && response.data) {
        console.log('카카오 로그인 URL 응답:', response.data);
        
        // 응답에서 URL 추출 (백엔드 응답 구조에 따라 조정 필요)
        let loginUrl = response.data.url || response.data.loginUrl || response.data;
        
        if (loginUrl) {
          // URL 정규화 (절대 URL로 변환)
          loginUrl = normalizeUrl(loginUrl);
          // 카카오 로그인 페이지로 리다이렉트
          window.location.href = loginUrl;
        } else {
          throw new Error('로그인 URL을 받아오지 못했습니다.');
        }
      } else {
        throw new Error('로그인 URL 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 URL 요청 중 오류:', error);
      alert('카카오 로그인을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleNaverLogin = async () => {
    try {
      console.log('네이버 로그인 URL 요청 시작');
      
      // naverLoginUrl API 호출
      const response = await naverLoginUrl();
      
      if (response && response.data) {
        console.log('네이버 로그인 URL 응답:', response.data);
        
        // 응답에서 URL 추출 (백엔드 응답 구조에 따라 조정 필요)
        let loginUrl = response.data.url || response.data.loginUrl || response.data;
        
        if (loginUrl) {
          // URL 정규화 (절대 URL로 변환)
          loginUrl = normalizeUrl(loginUrl);
          // 네이버 로그인 페이지로 리다이렉트
          window.location.href = loginUrl;
        } else {
          throw new Error('로그인 URL을 받아오지 못했습니다.');
        }
      } else {
        throw new Error('로그인 URL 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('네이버 로그인 URL 요청 중 오류:', error);
      alert('네이버 로그인을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('구글 로그인 URL 요청 시작');
      
      // googleLoginUrl API 호출
      const response = await googleLoginUrl();
      
      if (response && response.data) {
        console.log('구글 로그인 URL 응답:', response.data);
        
        // 응답에서 URL 추출 (백엔드 응답 구조에 따라 조정 필요)
        let loginUrl = response.data.url || response.data.loginUrl || response.data;
        
        if (loginUrl) {
          // URL 정규화 (절대 URL로 변환)
          loginUrl = normalizeUrl(loginUrl);
          // 구글 로그인 페이지로 리다이렉트
          window.location.href = loginUrl;
        } else {
          throw new Error('로그인 URL을 받아오지 못했습니다.');
        }
      } else {
        throw new Error('로그인 URL 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('구글 로그인 URL 요청 중 오류:', error);
      alert('구글 로그인을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={cn("container")}>
      <div className={cn("buttonGroup")}>
        <button className={`${cn("btn")} ${cn("kakao")}`} onClick={handleKakaoLogin}>
          <RiKakaoTalkFill className={cn("icon")} />
          카카오톡 로그인
        </button>
        <button className={`${cn("btn")} ${cn("naver")}`} onClick={handleNaverLogin}>
          <SiNaver className={cn("icon")} />
          네이버 로그인
        </button>
        <button className={`${cn("btn")} ${cn("google")}`} onClick={handleGoogleLogin}>
          <FcGoogle className={cn("icon")} />
          구글 로그인
        </button>
        <button className={`${cn("btn")} ${cn("org")}`} onClick={() => router.push("/login/org")}>
          <MdHome className={cn("icon")} />
          기관 로그인
        </button>
      </div>

      <div className={cn("contact")}>
        <div className={cn("contactInfo")}>
          <FaPhoneAlt className={cn("phoneIcon")} />
          <span className={cn("phoneNumber")}>010-5250-9548</span>
        </div>
        <p className={cn("info")}>
          SNS 로그인이 어려우신 분들은 위 번호로 연락 주세요
        </p>
      </div>
    </div>
  );
}
