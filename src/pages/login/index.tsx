"use client";

import styles from "../../styles/Login.module.scss";
import { MdHome } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import KakaoLoginButton from "@/components/kakao/KakaoLoginButton";
import NaverLoginButton from "@/components/naver/NaverLoginButton";
import GoogleLoginButton from "@/components/google/GoogleLoginButton";
import { useUserStore } from "@/lib/store/userStore";

const cn = classNames.bind(styles);

export default function LoginPage() {
  const router = useRouter();
  const { setSelectedSocialLoginProvider } = useUserStore();

  return (
    <div className={cn("container")}>
      <div className={cn("buttonGroup")}>
        <KakaoLoginButton
          onBeforeRedirect={() => setSelectedSocialLoginProvider("kakao")}
        />
        <NaverLoginButton
          onBeforeRedirect={() => setSelectedSocialLoginProvider("naver")}
        />
        <GoogleLoginButton
          onBeforeRedirect={() => setSelectedSocialLoginProvider("google")}
        />
        {/* <button
          className={`${cn("btn")} ${cn("org")}`}
          onClick={() => router.push("/login/org")}
        >
          <MdHome className={cn("icon")} />
          기관 로그인
        </button> */}
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
