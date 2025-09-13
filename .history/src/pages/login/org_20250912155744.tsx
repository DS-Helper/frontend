"use client";

import styles from "@/styles/Login.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

export default function OrgLoginPage() {
  return (
    <div className={cn("container")}> 
      <div className={cn("formWrapper")}>
        <h2 className={cn("title")}>기관 로그인</h2>

        <form className={cn("form")}>
          <label className={cn("label")}>이메일</label>
          <input
            type="email"
            placeholder="이메일"
            className={cn("input")}
          />

          <label className={cn("label")}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호"
            className={styles.input}
          />

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>
        </form>

        <div className={styles.links}>
          <a href="#">이메일찾기</a>
          <span>|</span>
          <a href="#">비밀번호찾기</a>
          <span>|</span>
          <a href="#">회원가입</a>
        </div>
      </div>
    </div>
  );
}
