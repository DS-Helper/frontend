"use client";

import { SiNaver } from "react-icons/si";
import classNames from "classnames/bind";
import { getNaverOAuthStartUrl } from "@/lib/apis/authUser";
import styles from "../../styles/Login.module.scss";

const cn = classNames.bind(styles);

interface NaverLoginButtonProps {
  onBeforeRedirect?: () => void;
}

export default function NaverLoginButton({ onBeforeRedirect }: NaverLoginButtonProps) {
  const handleClick = async () => {
    try {
      onBeforeRedirect?.();
      window.location.href = await getNaverOAuthStartUrl();
    } catch (error) {
      console.error(error);
      alert("?�이�?로그?�을 ?�작?????�습?�다. ?�시 ?�도?�주?�요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("naver")}`}
      onClick={() => void handleClick()}
    >
      <SiNaver className={cn("icon")} />
      ?�이�?로그??
    </button>
  );
}
