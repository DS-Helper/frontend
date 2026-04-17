"use client";

import { FcGoogle } from "react-icons/fc";
import classNames from "classnames/bind";
import { getGoogleOAuthStartUrl } from "@/lib/apis/authUser";
import styles from "../../styles/Login.module.scss";

const cn = classNames.bind(styles);

interface GoogleLoginButtonProps {
  onBeforeRedirect?: () => void;
}

export default function GoogleLoginButton({ onBeforeRedirect }: GoogleLoginButtonProps) {
  const handleClick = async () => {
    try {
      onBeforeRedirect?.();
      window.location.href = await getGoogleOAuthStartUrl();
    } catch (error) {
      console.error(error);
      alert("구�? 로그?�을 ?�작?????�습?�다. ?�시 ?�도?�주?�요.");
    }
  };

  return (
    <button
      type="button"
      className={`${cn("btn")} ${cn("google")}`}
      onClick={() => void handleClick()}
    >
      <FcGoogle className={cn("icon")} />
      구�? 로그??
    </button>
  );
}
