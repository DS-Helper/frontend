import styles from "@/styles/Footer.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function Footer() {
  return (
    <footer className={cn("footer")}>
      <div className={cn("footerContainer")}>
        <p className={cn("footerTitle")}>운영자 정보</p>
        <ul className={cn("footerInfo")}>
          <li>DS Helper 팀</li>
          <li>대표: 신인호</li>
        </ul>
        <p className={cn("footerTitle")}>연락처</p>
        <ul className={cn("footerInfo")}>
          <li>전화번호 : 010-5250-9548</li>
          <li>이메일 : dlsgh3760@gmail.com</li>
        </ul>
        <p className={cn("footerTitle")}>개인정보처리방침</p>
        <span className={cn("footerCopyright")}>
          © 2025 DS Helper. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
