"use client";

import { FcGoogle } from "react-icons/fc";
import classNames from "classnames/bind";
import { getGoogleOAuthStartUrl } from "@/lib/apis/authUser";
import styles from "@/styles/Login.module.scss";

const cn = classNames.bind(styles);

export default function GoogleLoginButton() {
  const handleClick = async () => {
    try {
      window.location.href = await getGoogleOAuthStartUrl();
    } catch (error) {
      console.error(error);
      alert("구글 로그인을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("google")}`}
      onClick={() => void handleClick()}
    >
      <FcGoogle className={cn("icon")} />
      구글 로그인
    </button>
  );
}
