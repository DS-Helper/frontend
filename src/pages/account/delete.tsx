import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "../../styles/AccountDelete.module.scss";
import { useUserStore } from "@/lib/store/userStore";
import { getMyInfo, parseAccountMyInfoResponse } from "@/lib/apis/account";

const cn = classNames.bind(styles);

export default function AccountDeletePage() {
  const router = useRouter();
  const { isVerified, checkAuthStatus, user, selectedSocialLoginProvider } = useUserStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
    if (selectedSocialLoginProvider === "kakao") return "카카??;
    if (selectedSocialLoginProvider === "naver") return "?�이�?;
    if (selectedSocialLoginProvider === "google") return "구�?";
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

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    alert("계정 ??�� 기능?� 준�?중입?�다.");
  };

  if (isAuthChecking) {
    return (
      <main className={cn("page")}>
        <section className={cn("panel")}>
          <p className={cn("loadingText")}>?�증 ?�보�??�인?�는 �?..</p>
        </section>
      </main>
    );
  }

  return (
    <main className={cn("page")}>
      <section className={cn("panel")}>
        <h1 className={cn("title")}>계정 ??��</h1>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>계정 ?�보</h2>
          <ul className={cn("list")}>
            {name && <li>?�름: {name}</li>}
            {email && <li>로그??계정: {email}</li>}
            {loginTypeText && <li>로그??방식: {loginTypeText}</li>}
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>??�� ?�내</h2>
          <ul className={cn("list")}>
            <li>계정????��?�면 ?�에?�헬??계정 �??�결???�용???�이?��? ??��?�니??</li>
            <li>??�� ??계정 복구??불�??�합?�다.</li>
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>??�� ?�보</h2>
          <ul className={cn("list")}>
            <li>?�에?�헬??계정 ?�보</li>
            <li>?�로???�보</li>
            <li>SNS 로그???�동 ?�보</li>
            <li>?��? ?�청 ?�역???�함???�보</li>
            <li>고객문의 ?�역???�함???�보</li>
            <li>?�통�??�동 ?�보 �?계정???�결???�보</li>
            <li>?�림 ?�신 ?�력 �?계정???�결???�림 ?�보</li>
          </ul>
        </div>

        <div className={cn("section")}>
          <h2 className={cn("sectionTitle")}>보�? ?�보</h2>
          <ul className={cn("list")}>
            <li>계정 고유 ?�별�?/li>
            <li>고객문의 ?�수 �??��? 기록</li>
            <li>?�고 ?�수 �?처리 기록</li>
            <li>계정 ??�� ?�청 처리 ?�력</li>
            <li>?�비???�속 기록 �?보안 ?��? 기록</li>
          </ul>
          <p className={cn("retentionNotice")}>
            관??법령 준?? 분쟁 ?�?? 보안 �?부???�용 방�?�??�해 ?�당?�보??1?�동??보�??�니??
          </p>
        </div>

        <button
          type="button"
          className={cn("deleteButton")}
          onClick={handleDeleteClick}
        >
          ??��
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
              ?�말�???��?�시겠습?�까?
            </h2>
            <p className={cn("confirmDescription")}>??�� ??계정 복구??불�??�합?�다.</p>
            <div className={cn("confirmActions")}>
              <button
                type="button"
                className={cn("confirmDeleteButton")}
                onClick={handleConfirmDelete}
              >
                ??��
              </button>
              <button
                type="button"
                className={cn("confirmCancelButton")}
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

