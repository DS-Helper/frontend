import { useState } from "react";
import styles from "@/styles/Header.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { BiSolidBell } from "react-icons/bi";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";

import logo from "@/public/logo.svg";
import { useRouter } from "next/router";

const cn = classNames.bind(styles);

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isVerified } = useUserStore();
  const router = useRouter();

  return (
    <header className={cn("header")}>
      <div className={cn("headerContainer")}>
        <div className={cn("headerLogo")} onClick={() => router.push("/")}>
          <Image src={logo} alt="logo" width={100} height={22} />
        </div>

          <div className={cn("headerLogin")}>
            {!isVerified ? (
              <button className={cn("userMenu")}>
                <div className={cn("userMenuIcon")}>
                  <BiSolidBell size={20} />
                </div>
                <div
                  className={cn("userMenuIcon")}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <FiMenu size={20} />
                </div>
              </button>
            ) : (
              <button className={cn("login")}>로그인</button>
            )}
          </div>
      </div>
      {isOpen && <Sidebar onClose={() => setIsOpen(false)} />}
    </header>
  );
}
