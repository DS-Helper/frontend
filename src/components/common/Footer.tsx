import styles from "@/styles/Footer.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import Link from "next/link";

const cn = classNames.bind(styles);

export default function Footer() {
  return (
    <footer className={cn("footer")}>
      <div className={cn("footerContainer")}>
        <div className={cn("socialLinkContainer")}>
          <Link
            href="https://blog.naver.com/dshelper"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="네이버 블로그 바로가기"
            className={cn("socialLink")}
          >
            <Image src="/naver_Icon.svg" alt="네이버 아이콘" width={48} height={48} />
          </Link>
          <Link
            href="https://www.instagram.com/ds_helper_?igsh=bGRtN3pkNG95MnB1&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인스타그램 바로가기"
            className={cn("socialLink")}
          >
            <Image src="/Instagram_Icon.svg" alt="인스타그램 아이콘" width={48} height={48} />
          </Link>
        </div>
        <div className={cn("footerInfoContainer")}>
          <p className={cn("footerTitle")}>운영자 정보</p>
          <ul className={cn("footerInfo")}>
            <li>DS Helper 팀</li>
            <li>대표: 신인호</li>
          </ul>
          <p className={cn("footerTitle")}>연락처</p>
          <ul className={cn("footerInfo", "footerInfoContact")}>
            <div className={cn("footerInfoContactItem")}>
              <li className={cn("footerInfoContactItemTitle")}>전화번호 : 010-5250-9548</li>
              <li>이메일 : dshelper77@gmail.com</li>
            </div>
          </ul>
          <div className={cn("footerLinkContainer")}>
            <Link href="/terms" className={cn("footerLink")}>이용약관</Link>
            <Link href="/privacy" className={cn("footerLink")}>개인정보처리방침</Link>
          </div>
          <span className={cn("footerCopyright")}>
            © 2025 DS Helper. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
