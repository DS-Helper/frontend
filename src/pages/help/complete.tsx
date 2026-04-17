import { useState, useEffect } from "react";
import styles from "../../styles/Modify.module.scss";
import classNames from "classnames/bind";
import NotificationModal from "@/components/Modal/Notification";
import image from "@/public/reservation_com.svg"
import Image from "next/image";

const cn = classNames.bind(styles);

export default function CompletePage() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // ?�이지 진입 ??바로 모달 ?�시
    setShowModal(true);
  }, []);

  const handleRequestNotifications = () => {
    // ?�림 권한 ?�청
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          alert('?�림???�용?�었?�니??');
        } else {
          alert('?�림??거�??�었?�니??');
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
          <h1 className={cn("completeTitle")}>?��? ?�청???�수?�었?�요</h1>
          <p className={cn("completeMessage")}>
            ?�퍼가 ?�약 ?�용???�인?????�정 ?��?�??�려?�릴게요. 
            <br />?�정?�면 ?�림??보내?�릴 ?�정?�에??
          </p>
          <div className={cn("imageBox")}>
            <Image src={image} alt="?��? ?�청 ?�수 ?�료" className={cn("completeImage")} />
          </div>
        </div>

        {/* ?�림 권한 ?�청 모달 */}
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