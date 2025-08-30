import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Modify.module.scss";
import classNames from "classnames/bind";
import NotificationModal from "@/components/Modal/Notification";
import image from "@/public/reservation_com.svg"
import Image from "next/image";

const cn = classNames.bind(styles);

export default function CompletePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 페이지 진입 시 바로 모달 표시
    setShowModal(true);
  }, []);

  const handleRequestNotifications = () => {
    // 알림 권한 요청
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          alert('알림이 허용되었습니다!');
        } else {
          alert('알림이 거부되었습니다.');
        }
      });
    }
    setShowModal(false);
  };

  const handleLater = () => {
    setShowModal(false);
  };

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <div className={cn("completeContent")}>
          <h1 className={cn("completeTitle")}>도움 요청이 접수되었어요</h1>
          <p className={cn("completeMessage")}>
            헬퍼가 예약 내용을 확인한 후 확정 여부를 알려드릴게요. 
            확정되면 알림을 보내드릴 예정이에요.
          </p>
          <div className="">
            <Image src={image} alt="도움 요청 접수 완료" />
          </div>
        </div>

        {/* 알림 권한 요청 모달 */}
        {showModal && (
          <NotificationModal
            onRequest={handleRequestNotifications}
            onLater={handleLater}
          />
        )}
      </main>
    </div>
  );
}