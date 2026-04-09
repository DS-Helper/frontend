import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/AccountEditName.module.scss";
import { getMyInfo, parseAccountMyInfoResponse, patchMyInfo } from "@/lib/apis/account";
import { AccountMyInfoData } from "@/types/account";

const cn = classNames.bind(styles);

export default function AccountEditNamePage() {
  const router = useRouter();
  const [myInfo, setMyInfo] = useState<AccountMyInfoData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      const res = await getMyInfo();
      if (cancelled) return;
      setPageLoading(false);
      const parsed = res?.data != null ? parseAccountMyInfoResponse(res.data) : null;
      if (parsed) {
        setMyInfo(parsed);
        setName(parsed.name?.trim() ?? "");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (pageLoading) return;
    const focusInput = () => inputRef.current?.focus({ preventScroll: true });
    focusInput();
    const rafId = requestAnimationFrame(focusInput);
    const timerId = window.setTimeout(focusInput, 120);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [pageLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next) {
      alert("이름을 입력해 주세요.");
      return;
    }
    if (!myInfo) return;
    setSubmitting(true);
    try {
      const res = await patchMyInfo({
        dto: {
          name: next,
          email: myInfo.email ?? "",
          birthyear: myInfo.birthyear,
          gender: myInfo.gender,
          phoneNumber: myInfo.phoneNumber,
          removeProfileImage: false,
        },
      });
      if (!res?.data) {
        alert("이름 수정에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      const envelope = res.data as { success?: boolean; message?: string };
      const parsed = parseAccountMyInfoResponse(res.data);
      if (envelope.success === false || !parsed) {
        alert(
          typeof envelope.message === "string" && envelope.message
            ? envelope.message
            : "이름 수정에 실패했습니다."
        );
        return;
      }
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className={cn("page")}>
        <p className={cn("pageLoading")}>프로필 정보를 불러오는 중…</p>
      </div>
    );
  }

  if (!myInfo) {
    return (
      <div className={cn("page")}>
        <p className={cn("pageLoading")}>프로필을 불러오지 못했습니다.</p>
        <button type="button" className={cn("submitButton")} onClick={() => router.back()}>
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={cn("page")}>
      <form className={cn("form")} onSubmit={(e) => void handleSubmit(e)}>
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

        <button type="submit" className={cn("submitButton")} disabled={submitting}>
          {submitting ? "수정 중…" : "수정하기"}
        </button>
      </form>
    </div>
  );
}
