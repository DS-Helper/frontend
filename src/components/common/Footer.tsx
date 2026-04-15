import styles from "../../styles/Footer.module.scss";
import classNames from "classnames/bind";
import Link from "next/link";

const cn = classNames.bind(styles);

export default function Footer() {
  return (
    <footer className={cn("footer")}>
      <div className={cn("footerContainer")}>
        <p className={cn("footerTitle")}>?�영???�보</p>
        <ul className={cn("footerInfo")}>
          <li>DS Helper ?�</li>
          <li>?�?? ?�인??/li>
        </ul>
        <p className={cn("footerTitle")}>?�락�?/p>
        <ul className={cn("footerInfo", "footerInfoContact")}>
          <li>?�화번호 : 010-5250-9548</li>
          <li>?�메??: dshelper77@gmail.com</li>
        </ul>
        <div className={cn("footerLinkContainer")}>
          <Link href="/terms" className={cn("footerLink")}>?�용?��?</Link>
          <Link href="/privacy" className={cn("footerLink")}>개인?�보처리방침</Link>
        </div>
        <span className={cn("footerCopyright")}>
          © 2025 DS Helper. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
