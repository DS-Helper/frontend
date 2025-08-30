import React from "react";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";

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
          <div className={cn("modalIcons")}>
            <div className={cn("bellIcon")}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C13.1 2 14 2.9 14 4V4.29C17.03 5.15 19 7.82 19 11V17L21 19V20H3V19L5 17V11C5 7.82 6.97 5.15 10 4.29V4C10 2.9 10.9 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="#FF6B35"/>
                {/* 소리 파동 효과 */}
                <circle cx="12" cy="4" r="2" fill="#FF6B35" opacity="0.3">
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className={cn("documentIcon")}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" fill="#fff" stroke="#0066FF" strokeWidth="2"/>
                <path d="M9 7H15M9 11H15M9 15H13" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="6" r="4" fill="#0066FF"/>
                <path d="M16 6L20 6M18 4L18 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

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
