import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../../styles/NotificationListModal.module.scss";
import { IoChevronUp } from "react-icons/io5";
import { FaCheck, FaTimes, FaBell, FaHeart } from "react-icons/fa";
import Image from "next/image";
import mailbox from "@/public/notice_icon.svg";

const cn = classNames.bind(styles);

interface NotificationListModalProps {
  isOpen: boolean;
  isClosing: boolean;
  isOpening: boolean;
  onClose: () => void;
}

export type NotificationType = 'confirmed' | 'cancelled' | 'upcoming' | 'completed';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  date: string; // MM.DD ?�식
  createdAt?: string; // ISO ?�짜 문자??
}

export default function NotificationListModal({
  isOpen,
  isClosing,
  isOpening,
  onClose,
}: NotificationListModalProps) {
  // 모달???�릴 ??body ?�크�?방�?
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCloseModal = () => {
    onClose();
  };

  // TODO: ?�제 ?�림 ?�이?��? API?�서 가?�오??로직 추�?
  // ?�시 ?�이??(?�스?�용)
  const notifications: Notification[] = [
    // {
    //   id: '1',
    //   type: 'confirmed',
    //   message: '?�전 10???��? ?�청???�정?�었?�요.',
    //   date: '06.11',
    // },
    // {
    //   id: '2',
    //   type: 'cancelled',
    //   message: '?�청?�신 ?�후 3???��? ?�청??취소?�었?�요.',
    //   date: '05.13',
    // },
    // {
    //   id: '3',
    //   type: 'upcoming',
    //   message: '30�??? DS ?�퍼가 ?�청?�신 ?�소�?방문???�정?�에??',
    //   date: '06.08',
    // },
    // {
    //   id: '4',
    //   type: 'completed',
    //   message: '?�늘 ?�행????마무�??�었?�요. ?�음?????��????�요?�실 ???�제?��? DS Helper �?찾아주세??',
    //   date: '05.17',
    // },
  ];

  // ?�짜 ?�맷???�수 (MM.DD ?�식)
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  // ?�림 ?�이�??�더�?
  const renderNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'confirmed':
        return (
          <div className={cn("notificationIcon", "iconConfirmed")}>
            <FaCheck size={16} />
          </div>
        );
      case 'cancelled':
        return (
          <div className={cn("notificationIcon", "iconCancelled")}>
            <FaTimes size={16} />
          </div>
        );
      case 'upcoming':
        return (
          <div className={cn("notificationIcon", "iconUpcoming")}>
            <FaBell size={16} />
          </div>
        );
      case 'completed':
        return (
          <div className={cn("notificationIcon", "iconCompleted")}>
            <FaHeart size={14} className={cn("heartIcon", "heartBlue")} />
            <FaHeart size={14} className={cn("heartIcon", "heartRed")} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className={cn("modalOverlay", { visible: isOpening && !isClosing })} 
          onClick={handleCloseModal}
        >
          <div 
            className={cn("modalContent", { closing: isClosing, opening: isOpening && !isClosing })} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* ?�더 */}
            <div className={cn("header")}>
              <div className={cn("headerTitle")}>
                <span className={cn("title")}>?�림</span>
              </div>
              <button className={cn("closeButton")} onClick={handleCloseModal}>
                <IoChevronUp size={20} className={cn("chevronIcon")} />
              </button>
            </div>

            {/* 메인 콘텐�?*/}
            <div className={cn("mainContent", { hasNotifications: notifications.length > 0 })}>
              {notifications.length === 0 ? (
                <div className={cn("emptyState")}>
                  <div className={cn("mailboxIllustration")}>
                    <Image src={mailbox} alt="mailbox" className={cn("mailboxImage")} width={122} height={150} />
                  </div>
                  <p className={cn("emptyMessage")}>
                    ?�직 ?�착???�림???�어?? <br/>
                    ?�요???�식???�기�?바로 ?�려?�릴게요!
                  </p>
                </div>
              ) : (
                <>
                  <div className={cn("notificationList")}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn("notificationItem", {
                          confirmed: notification.type === 'confirmed',
                        })}
                      >
                        {renderNotificationIcon(notification.type)}
                        <div className={cn("notificationContent")}>
                          <p className={cn("notificationMessage")}>{notification.message}</p>
                          <span className={cn("notificationDate")}>{notification.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={cn("notificationFooter")}>
                    <p className={cn("footerMessage")}>
                      ?�림?� 받�? ?�로부??7???�안 보�??�요.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
