"use client";

import styles from "../../styles/Login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";
import { MdHome } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import { naverLoginUrl, googleLoginUrl } from "@/lib/apis/authUser";
import KakaoLoginButton from "@/components/kakao/KakaoLoginButton";

const cn = classNames.bind(styles);

function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return url;
}

function pickLoginRedirect(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") {
    const s = data.trim();
    return s || null;
  }
  if (typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const key of ["url", "loginUrl", "redirectUrl"] as const) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();

  const handleNaverLogin = async () => {
    try {
      const response = await naverLoginUrl();
      const loginUrl = pickLoginRedirect(response?.data);
      if (!loginUrl) throw new Error("로그인 URL을 받아오지 못했습니다.");
      window.location.href = normalizeUrl(loginUrl);
    } catch (error) {
      console.error(error);
      alert("네이버 로그인을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await googleLoginUrl();
      const loginUrl = pickLoginRedirect(response?.data);
      if (!loginUrl) throw new Error("로그인 URL을 받아오지 못했습니다.");
      window.location.href = normalizeUrl(loginUrl);
    } catch (error) {
      console.error(error);
      alert("구글 로그인을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={cn("container")}>
      <div className={cn("buttonGroup")}>
        <KakaoLoginButton />
        <button
          className={`${cn("btn")} ${cn("naver")}`}
          onClick={handleNaverLogin}
        >
          <SiNaver className={cn("icon")} />
          네이버 로그인
        </button>
        <button
          className={`${cn("btn")} ${cn("google")}`}
          onClick={handleGoogleLogin}
        >
          <FcGoogle className={cn("icon")} />
          구글 로그인
        </button>
        <button
          className={`${cn("btn")} ${cn("org")}`}
          onClick={() => router.push("/login/org")}
        >
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
