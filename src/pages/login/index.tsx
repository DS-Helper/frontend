"use client";

import styles from "../../styles/Login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { MdHome } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import classNames from "classnames/bind";
import { useRouter } from "next/router";

const cn = classNames.bind(styles);

export default function LoginPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:8080/oauth/kakao/login'
    )}&response_type=code`;
    
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className={cn("container")}>
      <div className={cn("buttonGroup")}>
        <button className={`${cn("btn")} ${cn("kakao")}`} onClick={handleKakaoLogin}>
          <RiKakaoTalkFill className={cn("icon")} />
          카카오톡 로그인
        </button>
        <button className={`${cn("btn")} ${cn("naver")}`}>
          <SiNaver className={cn("icon")} />
          네이버 로그인
        </button>
        <button className={`${cn("btn")} ${cn("google")}`}>
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
