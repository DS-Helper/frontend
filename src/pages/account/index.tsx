import { useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import { useUserStore } from "@/lib/store/userStore";
import { handleLogout } from "@/lib/utils/logout";
import PhoneVerifyModal from "@/components/Modal/PhoneVerifyModal";

const cn = classNames.bind(styles);

export default function AccountPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      router.push("/");
    }
  };

  const handleVerify = () => {
    setIsVerifyModalOpen(true);
  };

  const handleRequestCode = (phone: string) => {
    // 인증번호 발송 API 연동 (추후 구현)
    console.log("인증번호 요청:", phone);
  };

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트는 _app 또는 미들웨어에서 처리 가능.
  // 여기서는 표시만 하고, user 없으면 기본 문구 표시
  const displayName = user?.name ?? "사용자";
  const displayEmail = user?.email ?? "dlsgh3760@naver.com";

  return (
    <div className={cn("wrapper")}>
      <aside className={cn("sidebar")}>
        <ul className={cn("navList")}>
          <li
            className={cn("navItem", "navItemActive")}
            onClick={() => {}}
            onKeyDown={(e) => e.key === "Enter" && (() => {})()}
            role="button"
            tabIndex={0}
          >
            프로필
          </li>
          <li
            className={cn("navItem")}
            onClick={() => router.push("/account/scrap")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/account/scrap")}
            role="button"
            tabIndex={0}
          >
            스크랩
          </li>
          <li
            className={cn("navItem")}
            onClick={handleLogoutClick}
            onKeyDown={(e) => e.key === "Enter" && handleLogoutClick()}
            role="button"
            tabIndex={0}
          >
            로그아웃
          </li>
        </ul>
      </aside>

      <main className={cn("main")}>
        <section className={cn("profileSection")}>
          <div className={cn("avatarWrap")}>
            <Image
              src="/userIconMypage.svg"
              alt="프로필"
              width={94}
              height={94}
            />
          </div>
          <div className={cn("userInfo")}>
            <h1 className={cn("userName")}>{displayName}</h1>
            <p className={cn("userEmail")}>{displayEmail}</p>
            <p className={cn("userBirthGender")}>
              2000.04.09 남자
            </p>
            <div className={cn("userPhoneRow")}>
              <span>010-5250-9548</span>
              <button
                type="button"
                className={cn("verifyButton")}
                onClick={handleVerify}
              >
                인증하기
              </button>
            </div>
          </div>
        </section>
      </main>

      <PhoneVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onRequestCode={handleRequestCode}
      />
    </div>
  );
}
