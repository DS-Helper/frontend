"use client";

import styles from "@/styles/Login.module.scss";
import classNames from "classnames/bind";
import { useState } from "react";
import { postLogin } from "../../lib/apis/authOrganization";
import { useUserStore } from "../../lib/store/userStore";
import { useRouter } from "next/router";

const cn = classNames.bind(styles);

export default function OrgLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsVerified, setUser, setUserType } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    try {
      const res = await postLogin(payload);
      
      // 로그인 성공 조건: 응답이 있고 상태가 200번대인 경우
      const isSuccess = res && res.status >= 200 && res.status < 300;
      
      if (isSuccess) {
        // 사용자 정보 저장 (기관 로그인 응답에 사용자 정보가 있다면)
        if (res.data?.user) {
          setUser(res.data.user);
        }
        
        // 사용자 타입을 기관으로 설정
        setUserType('organization');
        
        // 인증 상태 업데이트
        setIsVerified(true);
        router.push("/");
      } else {
        alert("로그인 실패!");
      }
    } catch (error: any) {
      
      // Axios 에러인 경우 더 자세한 정보 제공
      if (error.response) {
        // 서버에서 명시적으로 에러 메시지를 보낸 경우
        if (error.response.data?.message) {
          alert(`로그인 실패: ${error.response.data.message}`);
        } else {
          alert("로그인 처리 중 오류가 발생했습니다.");
        }
      } else {
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    }
  };
  
  return (
    <div className={cn("orgContainer")}> 
      <div className={cn("formWrapper")}>
        <h2 className={cn("title")}>기관 로그인</h2>

        <form className={cn("form")} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={cn("label")}>이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn("input")}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className={cn("label")}>비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn("input")}
              autoComplete="current-password"
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
