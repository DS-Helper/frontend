import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "./HelpDetail.module.scss";
import { helpRequests } from "@/mocks/helpList";

const cn = classNames.bind(styles);

export default function HelpDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [helpRequest, setHelpRequest] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (id) {
      const request = helpRequests.find(req => req.id === id);
      if (request) {
        setHelpRequest(request);
        setIsVisible(true);
      }
    }
  }, [id]);

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

  if (!helpRequest) {
    return null;
  }

  return (
    <div className={cn("modalOverlay", { visible: isVisible })} onClick={handleClose}>
      <div className={cn("modalContent")} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={cn("header")}>
          <div className={cn("statusContainer")}>
            <span className={cn("status", getStatusClass(helpRequest.status))}>
              {helpRequest.status}
            </span>
          </div>
          <button className={cn("closeButton")} onClick={handleClose}>
            <span className={cn("chevronIcon")}>⌄</span>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className={cn("mainContent")}>
          {/* 날짜 및 시간 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>날짜 및 시간</h3>
            <div className={cn("infoRow")}>
              <span className={cn("icon")}>📅</span>
              <span className={cn("infoText")}>
                {helpRequest.date} ({helpRequest.dayOfWeek}) {helpRequest.startTime} ~ {helpRequest.endTime}
              </span>
            </div>
            <div className={cn("infoRow")}>
              <span className={cn("icon")}>📍</span>
              <span className={cn("infoText")}>
                대구시 달성군 옥포읍 00아파트 000동 000호
              </span>
            </div>
          </section>

          {/* 신청자 정보 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>신청자 정보</h3>
            <div className={cn("infoRow")}>
              <span className={cn("label")}>이름 :</span>
              <span className={cn("value")}>홍길동</span>
            </div>
            <div className={cn("infoRow")}>
              <span className={cn("label")}>연락처 :</span>
              <span className={cn("value")}>010-0000-0000</span>
            </div>
          </section>

          {/* 도움 요청 내용 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>도움 요청 내용</h3>
            <div className={cn("contentText")}>
              {helpRequest.content}
            </div>
          </section>

          {/* 도움 받는 사람의 성별/수 */}
          <section className={cn("infoSection")}>
            <h3 className={cn("sectionTitle")}>도움 받는 사람의 성별/수</h3>
            <div className={cn("infoRow")}>
              <span className={cn("value")}>남자 / 2</span>
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
                헬퍼의 안전을 생각하여 애완견의 위험도 때문에, 해당 요청은 취소되었습니다.
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
