import { useEffect, useLayoutEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import { handleLogout } from "@/lib/utils/logout";
import AccountSideBar from "@/components/AccountSideBar";
import { getMyInfo, parseAccountMyInfoResponse, patchMyInfo } from "@/lib/apis/account";
import { AccountMyInfoData } from "@/types/account";
import { TiCamera } from "react-icons/ti";
import { IoIosArrowForward } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import editIcon from "@/public/boardPencilIcon.svg";

const cn = classNames.bind(styles);

export default function AccountPage() {
  const router = useRouter();
  const [myInfo, setMyInfo] = useState<AccountMyInfoData | null>(null);
  const [myInfoLoading, setMyInfoLoading] = useState(true);
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameEditSubmitting, setNameEditSubmitting] = useState(false);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const nameEditInputRef = useRef<HTMLInputElement>(null);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      router.push("/");
    }
  };

  const openProfileImagePicker = () => {
    if (profileImageUploading || !myInfo) return;
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myInfo) {
      e.target.value = "";
      return;
    }
    setProfileImageUploading(true);
    try {
      const res = await patchMyInfo({
        dto: {
          name: myInfo.name,
          email: myInfo.email ?? "",
          birthyear: myInfo.birthyear,
          gender: myInfo.gender,
          phoneNumber: myInfo.phoneNumber,
          removeProfileImage: false,
        },
        profileImage: file,
      });
      if (!res?.data) {
        alert("프로필 이미지 변경에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      const envelope = res.data as { success?: boolean; message?: string };
      const parsed = parseAccountMyInfoResponse(res.data);
      if (envelope.success === false || !parsed) {
        alert(
          typeof envelope.message === "string" && envelope.message
            ? envelope.message
            : "프로필 이미지 변경에 실패했습니다."
        );
        return;
      }
      setMyInfo(parsed);
    } finally {
      setProfileImageUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchMyInfo = async () => {
      setMyInfoLoading(true);
      const res = await getMyInfo();
      if (cancelled) return;
      setMyInfoLoading(false);
      if (!res?.data) {
        setMyInfo(null);
        return;
      }
      const parsed = parseAccountMyInfoResponse(res.data);
      if (parsed) {
        setMyInfo(parsed);
      } else {
        setMyInfo(null);
      }
    };
    fetchMyInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNameEditModal = () => {
    setNameDraft(myInfo?.name?.trim() ?? "");
    setNameEditOpen(true);
  };

  const closeNameEditModal = () => {
    setNameEditOpen(false);
  };

  useLayoutEffect(() => {
    if (!nameEditOpen) return;
    nameEditInputRef.current?.focus();
  }, [nameEditOpen]);

  useEffect(() => {
    if (!nameEditOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setNameEditOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [nameEditOpen]);

  const handleNameEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = nameDraft.trim();
    if (!next) {
      alert("이름을 입력해 주세요.");
      return;
    }
    if (!myInfo) return;
    setNameEditSubmitting(true);
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
      setMyInfo(parsed);
      setNameEditOpen(false);
    } finally {
      setNameEditSubmitting(false);
    }
  };

  const genderText = useMemo(() => {
    const raw = (myInfo?.gender ?? "").toLowerCase();
    if (raw === "female" || raw === "f") return "여자";
    if (raw === "male" || raw === "m") return "남자";
    return myInfo?.gender?.trim() ?? "";
  }, [myInfo?.gender]);

  const birthGenderText = useMemo(() => {
    const year = myInfo?.birthyear?.trim() ?? "";
    if (!year || !genderText) return "";
    return `${year} ${genderText}`;
  }, [myInfo?.birthyear, genderText]);

  const displayName = myInfo?.name?.trim() || "사용자";
  const displayEmail = myInfo?.email?.trim() ?? "";
  const displayPhone = myInfo?.phoneNumber?.trim() ?? "";
  const profileImageSrc = myInfo?.profileImageUrl?.trim() || "/userIconMypage.svg";

  return (
    <div className={cn("wrapper")}>
      <AccountSideBar activeTab="profile" onLogout={handleLogoutClick} />

      <main className={cn("main")}>
        <input
          id="account-profile-image-input"
          ref={profileImageInputRef}
          type="file"
          accept="image/*"
          className={cn("profileImageInput")}
          onChange={handleProfileImageChange}
          tabIndex={-1}
          aria-hidden
        />
        {myInfoLoading ? (
          <p className={cn("mainLoading")}>프로필 정보를 불러오는 중…</p>
        ) : (
          <>
        <section className={cn("profileSection")}>
          <div className={cn("avatarWrap")}>
            <Image
              src={profileImageSrc}
              alt="프로필"
              width={94}
              height={94}
              className={cn("avatarImage")}
              unoptimized={profileImageSrc.startsWith("http")}
            />
            <div className={cn("avatarCameraButtonWrap")}>
              <button
                type="button"
                className={cn("avatarCameraButton")}
                onClick={openProfileImagePicker}
                aria-label="프로필 이미지 변경"
                disabled={profileImageUploading}
                aria-busy={profileImageUploading}
              >
                <TiCamera className={cn("avatarCameraIcon")} aria-hidden />
              </button>
            </div>
          </div>
          <div className={cn("userInfo")}>
            <div className={cn("userNameWrap")}>
              <h1 className={cn("userName")}>{displayName}</h1>
              <button
                type="button"
                className={cn("nameEditOpenButton")}
                onClick={openNameEditModal}
                aria-label="이름 변경"
              >
                <Image src={editIcon} alt="" width={24} height={24} className={cn("editButton")} />
              </button>
            </div>
            {displayEmail && <p className={cn("userEmail")}>{displayEmail}</p>}
            {birthGenderText && (
              <p className={cn("userBirthGender")}>
                {birthGenderText}
              </p>
            )}
            {displayPhone && (
              <div className={cn("userPhoneRow")}>
                <span>{displayPhone}</span>
              </div>
            )}
          </div>
        </section>

        <section className={cn("profileSectionMobile")}>
          <div className={cn("avatarWrap", "avatarWrapMobile")}>
            <Image
              src={profileImageSrc}
              alt="프로필"
              width={88}
              height={88}
              className={cn("avatarImage")}
              unoptimized={profileImageSrc.startsWith("http")}
            />
            <div className={cn("avatarCameraButtonWrap")}>
              <button
                type="button"
                className={cn("avatarCameraButton")}
                onClick={openProfileImagePicker}
                aria-label="프로필 이미지 변경"
                disabled={profileImageUploading}
                aria-busy={profileImageUploading}
              >
                <TiCamera className={cn("avatarCameraIcon")} aria-hidden />
              </button>
            </div>
          </div>

          <div className={cn("mobileInfoList")}>
            <div className={cn("mobileInfoRow")}>
              <span className={cn("mobileInfoLabel")}>이름</span>
              <span className={cn("mobileInfoValueWrap")}>
                <span className={cn("mobileInfoValue")}>{displayName}</span>
                  <button
                    type="button"
                    className={cn("mobileInfoArrowButton")}
                    onClick={() => router.push("/account/edit-name")}
                    aria-label="이름 수정 페이지로 이동"
                  >
                    <IoIosArrowForward className={cn("mobileInfoArrow")} aria-hidden />
                  </button>
              </span>
            </div>

            {displayEmail && (
              <div className={cn("mobileInfoRow")}>
                <span className={cn("mobileInfoLabel")}>이메일</span>
                <span className={cn("mobileInfoValue")}>{displayEmail}</span>
              </div>
            )}

            {myInfo?.birthyear?.trim() && (
              <div className={cn("mobileInfoRow")}>
                <span className={cn("mobileInfoLabel")}>생년월일</span>
                <span className={cn("mobileInfoValue")}>{myInfo.birthyear}</span>
              </div>
            )}

            {displayPhone && (
              <div className={cn("mobileInfoRow")}>
                <span className={cn("mobileInfoLabel")}>전화번호</span>
                <span className={cn("mobileInfoValue")}>{displayPhone}</span>
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>

      {nameEditOpen && (
        <div
          className={cn("nameEditModalOverlay")}
          role="presentation"
          onClick={closeNameEditModal}
        >
          <div
            className={cn("nameEditModal")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-name-edit-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className={cn("nameEditModalHeader")}>
              <h2 id="account-name-edit-title" className={cn("nameEditModalTitle")}>
                이름 변경
              </h2>
              <button
                type="button"
                className={cn("nameEditModalClose")}
                onClick={closeNameEditModal}
                aria-label="닫기"
              >
                <IoMdClose className={cn("nameEditModalCloseIcon")} aria-hidden />
              </button>
            </div>
            <form className={cn("nameEditModalForm")} onSubmit={handleNameEditSubmit}>
              <label htmlFor="account-name-edit-input" className={cn("visuallyHidden")}>
                이름
              </label>
              <input
                ref={nameEditInputRef}
                id="account-name-edit-input"
                type="text"
                className={cn("nameEditModalInput")}
                value={nameDraft}
                onChange={(ev) => setNameDraft(ev.target.value)}
                autoComplete="name"
                maxLength={40}
              />
              <button
                type="submit"
                className={cn("nameEditModalSubmit")}
                disabled={nameEditSubmitting}
              >
                {nameEditSubmitting ? "수정 중…" : "수정하기"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
