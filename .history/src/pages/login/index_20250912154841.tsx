"use client";

import styles from "../../styles/Login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { MdHome } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function LoginPage() {
  return (
    <div className={cn("container")}>
      <div className={cn("buttonGroup")}>
        <button className={`${cn("btn")} ${cn("kakao")}`}>
          <RiKakaoTalkFill className={cn("icon")} />
          카카오톡 로그인
        </button>
        <button className={`${cn("btn")} ${cn("naver")}`}>
          <SiNaver className={styles.icon} />
          네이버 로그인
        </button>
        <button className={`${cn("btn")} ${cn("google")}`}>
          <FcGoogle className={styles.icon} />
          구글 로그인
        </button>
        <button className={`${styles.btn} ${styles.org}`}>
          <MdHome className={cn("icon")} />
          기관 로그인
        </button>
      </div>

      <div className={styles.contact}>
        <FaPhoneAlt className={styles.phoneIcon} />
        <span className={styles.phoneNumber}>010-5250-9548</span>
        <p className={styles.info}>
          SNS 로그인이 어려우신 분들은 위 번호로 연락 주세요
        </p>
      </div>
    </div>
  );
}
