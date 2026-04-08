import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/AccountEditName.module.scss";

const cn = classNames.bind(styles);

export default function AccountEditNamePage() {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const focusInput = () => inputRef.current?.focus({ preventScroll: true });
    focusInput();
    const rafId = requestAnimationFrame(focusInput);
    const timerId = window.setTimeout(focusInput, 120);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 이름 수정 API 연동 예정
  };

  return (
    <div className={cn("page")}>
      <form className={cn("form")} onSubmit={handleSubmit}>
        <h1 className={cn("title")}>이름을 입력해주세요</h1>

        <label htmlFor="account-edit-name" className={cn("label")}>
          이름<span className={cn("requiredDot")} aria-hidden />
        </label>
        <input
          ref={inputRef}
          id="account-edit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn("input")}
          autoFocus
        />

        <button type="submit" className={cn("submitButton")}>
          수정하기
        </button>
      </form>
    </div>
  );
}
