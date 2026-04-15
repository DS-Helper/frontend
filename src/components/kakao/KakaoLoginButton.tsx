"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import classNames from "classnames/bind";
import { buildKakaoAuthorizeUrl } from "@/lib/apis/authUser";
import styles from "../../styles/Login.module.scss";

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
      alert("카카??로그?�을 ?�작?????�습?�다. ?�경 ?�정???�인?�주?�요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("kakao")}`}
      onClick={handleClick}
    >
      <RiKakaoTalkFill className={cn("icon")} />
      카카?�톡 로그??
    </button>
  );
}
