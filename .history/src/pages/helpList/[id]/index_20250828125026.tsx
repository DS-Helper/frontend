import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "./HelpDetail.module.scss";
import { helpRequests } from "@/mocks/helpList";
import { getHelpDetailById } from "@/mocks/helpDetail";
import { useUserStore } from "@/store/userStore";
import { IoChevronDown } from "react-icons/io5";
import Image from 'next/image';

import mapIcon from "@/public/mapIcon.svg"
import calendarIcon from "@/public/calendarIcon.svg"

const cn = classNames.bind(styles);

export default function HelpDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserStore();
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [helpDetail, setHelpDetail] = useState<HelpDetailData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (id && user) {
      // 유저 본인의 도움 요청만 가져오기
      const request = helpRequests.find(req => req.id === id && req.userId === user.id);
      const detail = getHelpDetailById(id as string);
      
      if (request && detail && detail.userId === user.id) {
        setHelpRequest(request);
        setHelpDetail(detail);
        setIsVisible(true);
      } else {
        // 권한이 없거나 데이터가 없는 경우
        router.push('/helpList');
      }
    }
  }, [id, user, router]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleCancelReservation = () => {
    if (confirm("예약을 취소하시겠습니까?")) {
      console.log("예약 취소:", id);
      // 예약 취소 로직
      handleClose();
    }
  };

  // 유저가 로그인하지 않은 경우
  if (!user) {
    router.push('/helpList');
    return null;
  }

  if (!helpRequest) {
    return null;
  }

  return (
    <div className={cn("modalOverlay", { visible: isVisible })} onClick={handleClose}>
      <div className={cn("modalContent")} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={cn("header", getStatusClass(helpRequest.status))}>
          <div className={cn("statusContainer")}>
            <span className={cn("status", getStatusClass(helpRequest.status))}>
              {helpRequest.status}
            </span>
          </div>
          <button className={cn("closeButton")} onClick={handleClose}>
            <span className={cn("chevronIcon", getStatusClass(helpRequest.status))}>
              <IoChevronDown />
            </span>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className={cn("mainContent")}>
          {/* 날짜 및 시간 */}
          <section className={cn("infoSection", "infoDate")}>
            <h3 className={cn("sectionTitle")}>날짜 및 시간</h3>
            <div className={cn("infoRow")}>
              <span className={cn("icon")}>
                <Image width={30} height={30} alt="예약 날짜" src={calendarIcon} />
              </span>
              <span className={cn("infoText")}>
                {helpRequest.date} ({helpRequest.dayOfWeek}) {helpRequest.startTime} ~ {helpRequest.endTime}
              </span>
            </div>
            <div className={cn("infoRow")}>
              <span className={cn("icon")}>
                <Image width={30} height={30} alt="예약 시간" src={mapIcon} />
              </span>
              <span className={cn("infoText")}>
                {helpDetail?.location || "위치 정보 없음"}
              </span>
            </div>
          </section>

          {/* 신청자 정보 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>신청자 정보</h3>
            {user.type === "기업" && helpDetail?.applicantInfo?.organizationName && (
              <div className={cn("infoRow")}>
                <span className={cn("label")}>기관명 :</span>
                <span className={cn("value")}>{helpDetail.applicantInfo.organizationName}</span>
              </div>
            )}
            <div className={cn("infoRow")}>
              <span className={cn("label")}>이름 :</span>
              <span className={cn("value")}>{helpDetail?.applicantInfo?.name || "이름 없음"}</span>
            </div>
            <div className={cn("infoRow")}>
              <span className={cn("label")}>연락처 :</span>
              <span className={cn("value")}>{helpDetail?.applicantInfo?.contact || "연락처 없음"}</span>
            </div>
          </section>

          {/* 도움 요청 내용 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>도움 요청 내용</h3>
            {user.type === "기업" ? (
              <div className={cn("detailedContent")}>
                <div className={cn("contentParagraph")}>
                  할머니가 병원에 꼭 가셔야 하는데, 평소 허리가 많이 아프셔서 혼자서는 이동이 어려우세요. 집에서 병원까지는 도보로 약 10분 거리인데, 중간에 오르막이 있어서 부축이 필요합니다.
                </div>
                <div className={cn("contentParagraph")}>
                  병원 도착 후에는 진료 접수와 휠체어 대여를 도와주실 수 있으면 좋겠습니다. 진료가 끝나면 약국에도 들러야 하는데, 약 수령까지 함께 동행해주셨으면 합니다.
                </div>
                <div className={cn("contentParagraph")}>
                  혹시 병원 진료 시간이 오래 걸릴 수 있으니, 너무 촉박하지 않은 일정으로 부탁드립니다. 마지막에 다시 집까지 함께 돌아와주시면 정말 감사하겠습니다.
                </div>
              </div>
            ) : (
              <div className={cn("contentText")}>
                {helpRequest.content}
              </div>
            )}
          </section>

          {/* 도움 받는 사람의 성별/수 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>도움 받는 사람의 성별/수</h3>
            <div className={cn("infoRow")}>
              <span className={cn("value")}>
                {helpDetail?.recipientInfo?.gender || "성별 없음"} / {helpDetail?.recipientInfo?.count || 0}
              </span>
            </div>
          </section>

          {/* 특이사항 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>특이사항</h3>
            <div className={cn("contentText")}>
              집에 큰 개가 있습니다. 사람을 잘 따르지만, 처음 방문하실 때는 짖을 수 있으니 놀라지 마세요. 개는 묶여 있으니 접촉은 없습니다.
            </div>
          </section>

          {/* 취소된 경우 거절사유 표시 */}
          {helpRequest.status === "취소" && (
            <section className={cn("infoSection")}>
              <h3 className={cn("sectionTitle")}>거절사유</h3>
              <div className={cn("contentText", "rejectionReason")}>
                {helpDetail?.rejectionReason || "거절사유 없음"}
              </div>
            </section>
          )}
        </div>

        {/* 액션 버튼 */}
        {helpRequest.status === "예정" && (
          <div className={cn("actionSection")}>
            <button 
              className={cn("cancelButton")} 
              onClick={handleCancelReservation}
            >
              예약 취소하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case "예정":
      return "scheduled";
    case "완료":
      return "completed";
    case "취소":
      return "cancelled";
    default:
      return "";
  }
}
