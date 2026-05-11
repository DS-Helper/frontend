import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/AccountDelete.module.scss";
import { useUserStore, resetUserSession } from "@/lib/store/userStore";
import {
  deleteGoogle,
  deleteKakao,
  deleteNaver,
  getMyInfo,
  parseAccountMyInfoResponse,
} from "@/lib/apis/account";

const cn = classNames.bind(styles);

export default function AccountDeletePage() {
  const router = useRouter();
  const { isVerified, checkAuthStatus, user, selectedSocialLoginProvider, accessToken } =
    useUserStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const guard = async () => {
      await checkAuthStatus({ force: true });
      if (cancelled) return;
      if (!useUserStore.getState().isVerified) {
        await router.replace("/login");
        return;
      }
      setIsAuthChecking(false);
    };

    void guard();
    return () => {
      cancelled = true;
    };
  }, [checkAuthStatus, router]);

  useEffect(() => {
    if (!isVerified) return;
    let cancelled = false;
    const fetchMyInfo = async () => {
      const res = await getMyInfo();
      if (cancelled || !res?.data) return;
      const parsed = parseAccountMyInfoResponse(res.data);
      if (!parsed) return;
      setName(parsed.name?.trim() ?? "");
      setEmail(parsed.email?.trim() ?? "");
    };
    void fetchMyInfo();
    return () => {
      cancelled = true;
    };
  }, [isVerified]);

  const loginTypeText = useMemo(() => {
    if (selectedSocialLoginProvider === "kakao") return "카카오";
    if (selectedSocialLoginProvider === "naver") return "네이버";
    if (selectedSocialLoginProvider === "google") return "구글";
    const raw = user?.type?.trim() ?? "";
    if (!raw) return "";
    return raw;
  }, [selectedSocialLoginProvider, user?.type]);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    const token = accessToken?.trim() ?? "";
    if (!token) {
      alert("로그인 토큰을 확인할 수 없어요. 다시 로그인한 뒤 시도해 주세요.");
      return;
    }

    const provider = selectedSocialLoginProvider;
    if (provider !== "google" && provider !== "kakao" && provider !== "naver") {
      alert("SNS 로그인으로 연동된 계정만 이 화면에서 삭제할 수 있어요.");
      return;
    }

    setIsDeleting(true);
    try {
      const res =
        provider === "google"
          ? await deleteGoogle(token)
          : provider === "kakao"
            ? await deleteKakao(token)
            : await deleteNaver(token);

      if (res == null) {
        alert("계정 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }

      setDeleteConfirmOpen(false);
      resetUserSession();
      await router.replace("/");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <main className={cn("page")}>
        <section className={cn("panel")}>
          <p className={cn("loadingText")}>인증 정보를 확인하는 중...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={cn("page")}>
      <section className={cn("panel")}>
        <h1 className={cn("title")}>계정 삭제</h1>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>계정 정보</h2>
          <ul className={cn("list")}>
            {name && <li>이름: {name}</li>}
            {email && <li>로그인 계정: {email}</li>}
            {loginTypeText && <li>로그인 방식: {loginTypeText}</li>}
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>삭제 안내</h2>
          <ul className={cn("list")}>
            <li>계정을 삭제하면 디에스헬퍼 계정 및 연결된 사용자 데이터가 삭제됩니다.</li>
            <li>삭제 후 계정 복구는 불가능합니다.</li>
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>삭제 정보</h2>
          <ul className={cn("list")}>
            <li>디에스헬퍼 계정 정보</li>
            <li>프로필 정보</li>
            <li>SNS 로그인 연동 정보</li>
            <li>도움 요청 내역에 포함된 정보</li>
            <li>고객문의 내역에 포함된 정보</li>
            <li>소통방 활동 정보 중 계정에 연결된 정보</li>
            <li>알림 수신 이력 및 계정에 연결된 알림 정보</li>
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>보관 정보</h2>
          <ul className={cn("list")}>
            <li>계정 고유 식별값</li>
            <li>고객문의 접수 및 답변 기록</li>
            <li>신고 접수 및 처리 기록</li>
            <li>계정 삭제 요청 처리 이력</li>
            <li>서비스 접속 기록 및 보안 점검 기록</li>
          </ul>
          <p className={cn("retentionNotice")}>
            관련 법령 준수, 분쟁 대응, 보안 및 부정 이용 방지를 위해 해당정보는 1년동안 보관됩니다.
          </p>
        </div>

        <button
          type="button"
          className={cn("deleteButton")}
          onClick={handleDeleteClick}
        >
          삭제
        </button>
      </section>

      {deleteConfirmOpen && (
        <div
          className={cn("confirmOverlay")}
          role="presentation"
          onClick={handleCloseDeleteConfirm}
        >
          <div
            className={cn("confirmDialog")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-delete-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="account-delete-confirm-title" className={cn("confirmTitle")}>
              정말로 삭제하시겠습니까?
            </h2>
            <p className={cn("confirmDescription")}>삭제 후 계정 복구는 불가능합니다.</p>
            <div className={cn("confirmActions")}>
              <button
                type="button"
                className={cn("confirmDeleteButton")}
                disabled={isDeleting}
                onClick={() => void handleConfirmDelete()}
              >
                {isDeleting ? "처리 중…" : "삭제"}
              </button>
              <button
                type="button"
                className={cn("confirmCancelButton")}
                disabled={isDeleting}
                onClick={handleCloseDeleteConfirm}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

