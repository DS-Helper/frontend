"use client";

import styles from "@/styles/Login.module.scss";
import classNames from "classnames/bind";
import { useState } from "react";

const cn = classNames.bind(styles);

export default function OrgLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <div className={cn("orgContainer")}> 
      <div className={cn("formWrapper")}>
        <h2 className={cn("title")}>기관 로그인</h2>

        <form className={cn("form")}>
          <div>
            <label className={cn("label")}>이메일</label>
            <input
              type="email"
              placeholder="이메일"
              className={cn("input")}
            />
          </div>

          <div>
            <label className={cn("label")}>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호"
              className={cn("input")}
            />
          </div>

          <button type="submit" className={cn("loginBtn")}>
            로그인
          </button>
        </form>

        <div className={cn("links")}>
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
