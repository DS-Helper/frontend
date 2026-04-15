"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import classNames from "classnames/bind";
import { buildKakaoAuthorizeUrl } from "@/lib/apis/authUser";
import styles from "@/styles/Login.module.scss";

const cn = classNames.bind(styles);

interface KakaoLoginButtonProps {
  onBeforeRedirect?: () => void;
}

export default function KakaoLoginButton({ onBeforeRedirect }: KakaoLoginButtonProps) {
  const handleClick = () => {
    try {
      onBeforeRedirect?.();
      window.location.href = buildKakaoAuthorizeUrl();
    } catch (error) {
      console.error(error);
      alert("카카오 로그인을 시작할 수 없습니다. 환경 설정을 확인해주세요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("kakao")}`}
      onClick={handleClick}
    >
      <RiKakaoTalkFill className={cn("icon")} />
      카카오톡 로그인
    </button>
  );
}
