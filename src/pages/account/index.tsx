import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/styles/Account.module.scss";
import { handleLogout } from "@/lib/utils/logout";
import AccountSideBar from "@/components/AccountSideBar";
import { getMyInfo } from "@/lib/apis/account";
import { AccountMyInfoData } from "@/types/account";
import { TiCamera } from "react-icons/ti";
import { IoIosArrowForward } from "react-icons/io";
import editIcon from "@/public/boardPencilIcon.svg";

const cn = classNames.bind(styles);

export default function AccountPage() {
  const router = useRouter();
  const [myInfo, setMyInfo] = useState<AccountMyInfoData | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

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
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: 프로필 이미지 업로드 API 연동
    e.target.value = "";
  };

  useEffect(() => {
    let cancelled = false;
    const fetchMyInfo = async () => {
      const res = await getMyInfo();
      if (cancelled) return;
      const payload = res?.data;
      if (payload?.success && payload.data) {
        setMyInfo(payload.data);
      }
    };
    fetchMyInfo();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              className={cn("profileImageInput")}
              onChange={handleProfileImageChange}
              tabIndex={-1}
              aria-hidden
            />
            <div className={cn("avatarCameraButtonWrap")}>
              <button
                type="button"
                className={cn("avatarCameraButton")}
                onClick={openProfileImagePicker}
                aria-label="프로필 이미지 변경"
              >
                <TiCamera className={cn("avatarCameraIcon")} aria-hidden />
              </button>
            </div>
          </div>
          <div className={cn("userInfo")}>
            <div className={cn("userNameWrap")}>
              <h1 className={cn("userName")}>{displayName}</h1>
              <Image src={editIcon} alt="프로필" width={24} height={24} className={cn("editButton")} />
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
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              className={cn("profileImageInput")}
              onChange={handleProfileImageChange}
              tabIndex={-1}
              aria-hidden
            />
            <div className={cn("avatarCameraButtonWrap")}>
              <button
                type="button"
                className={cn("avatarCameraButton")}
                onClick={openProfileImagePicker}
                aria-label="프로필 이미지 변경"
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
      </main>
    </div>
  );
}
