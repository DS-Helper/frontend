import React from "react";
import classNames from "classnames/bind";
import styles from "../../styles/Modify.module.scss";
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
        {/* 모달 ?�용 */}
        <div className={cn("modalContent")}>
          {/* ?�이�??�역 */}
          <Image src={notification} alt="?�림 ?�청" width={150} height={150} className={cn("notificationImage")} />
          <div className={cn("modalText")}>
            <h2 className={cn("modalTitle")}>?�청 처리 결과�??�려?�릴게요!</h2>
            <p className={cn("modalDescription")}>
              ?�림???�용?�시�? ?�정 �?취소 ?�내�?받을 ???�어??
            </p>
          </div>

          {/* 버튼 ?�역 */}
          <div className={cn("modalButtons")}>
            <button 
              className={cn("requestButton")} 
              onClick={onRequest}
            >
              ?�용?�기
            </button>
            <button 
              className={cn("laterButton")} 
              onClick={onLater}
            >
              거절?�기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
