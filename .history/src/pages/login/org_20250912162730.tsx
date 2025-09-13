"use client";

import styles from "@/styles/Login.module.scss";
import classNames from "classnames/bind";
import { useState } from "react";
import { postLogin } from "../../lib/apis/authOrganization";

const cn = classNames.bind(styles);

export default function OrgLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    const res = await postLogin(payload);

    if (res) {
      alert("로그인 성공!");
      setIsVeri
    } else {
      alert("로그인 실패!");
    }
  };
  
  return (
    <div className={cn("orgContainer")}> 
      <div className={cn("formWrapper")}>
        <h2 className={cn("title")}>기관 로그인</h2>

        <form className={cn("form")} onSubmit={handleSubmit}>
          <div>
            <label className={cn("label")}>이메일</label>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn("input")}
            />
          </div>

          <div>
            <label className={cn("label")}>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
