"use client";

import { SiNaver } from "react-icons/si";
import classNames from "classnames/bind";
import { getNaverOAuthStartUrl } from "@/lib/apis/authUser";
import styles from "@/styles/Login.module.scss";

const cn = classNames.bind(styles);

export default function NaverLoginButton() {
  const handleClick = async () => {
    try {
      window.location.href = await getNaverOAuthStartUrl();
    } catch (error) {
      console.error(error);
      alert("네이버 로그인을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("naver")}`}
      onClick={() => void handleClick()}
    >
      <SiNaver className={cn("icon")} />
      네이버 로그인
    </button>
  );
}
