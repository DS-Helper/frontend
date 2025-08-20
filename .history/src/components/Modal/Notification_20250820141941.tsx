import React from "react";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";
import Image from "next/image";
import notification from "@/public/reservation_notice.svg"

const cn = classNames.bind(styles);

interface NotificationModalProps {
  onRequest: () => void;
  onLater: () => void;
}

export default function NotificationModal({ onRequest, onLater }: NotificationModalProps) {
  return (
    <div className={cn("modalOverlay")}>
      <div className={cn("notificationModal")}>
        {/* 모달 내용 */}
        <div className={cn("modalContent")}>
          {/* 아이콘 영역 */}
          <Image src={notification} alt="" />

          {/* 제목 */}
          <h2 className={cn("modalTitle")}>요청 처리 결과를 알려드릴게요!</h2>
          
          {/* 설명 */}
          <p className={cn("modalDescription")}>
            알림을 허용하시면, 확정 및 취소 안내를 받을 수 있어요.
          </p>

          {/* 버튼 영역 */}
          <div className={cn("modalButtons")}>
            <button 
              className={cn("requestButton")} 
              onClick={onRequest}
            >
              요청하기
            </button>
            <button 
              className={cn("laterButton")} 
              onClick={onLater}
            >
              나중에 할래요
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
