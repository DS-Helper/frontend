import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/NotificationListModal.module.scss";
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
  date: string; // MM.DD 형식
  createdAt?: string; // ISO 날짜 문자열
}

export default function NotificationListModal({
  isOpen,
  isClosing,
  isOpening,
  onClose,
}: NotificationListModalProps) {
  // 모달이 열릴 때 body 스크롤 방지
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

  // TODO: 실제 알림 데이터를 API에서 가져오는 로직 추가
  // 예시 데이터 (테스트용)
  const notifications: Notification[] = [
    // {
    //   id: '1',
    //   type: 'confirmed',
    //   message: '오전 10시 도움 요청이 확정되었어요.',
    //   date: '06.11',
    // },
    // {
    //   id: '2',
    //   type: 'cancelled',
    //   message: '요청하신 오후 3시 도움 요청이 취소되었어요.',
    //   date: '05.13',
    // },
    // {
    //   id: '3',
    //   type: 'upcoming',
    //   message: '30분 뒤, DS 헬퍼가 요청하신 장소로 방문할 예정이에요.',
    //   date: '06.08',
    // },
    // {
    //   id: '4',
    //   type: 'completed',
    //   message: '오늘 동행이 잘 마무리 되었어요. 다음에 또 도움이 필요하실 땐 언제든지 DS Helper 를 찾아주세요.',
    //   date: '05.17',
    // },
  ];

  // 날짜 포맷팅 함수 (MM.DD 형식)
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  // 알림 아이콘 렌더링
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
            {/* 헤더 */}
            <div className={cn("header")}>
              <div className={cn("headerTitle")}>
                <span className={cn("title")}>알림</span>
              </div>
              <button className={cn("closeButton")} onClick={handleCloseModal}>
                <IoChevronUp size={20} className={cn("chevronIcon")} />
              </button>
            </div>

            {/* 메인 콘텐츠 */}
            <div className={cn("mainContent", { hasNotifications: notifications.length > 0 })}>
              {notifications.length === 0 ? (
                <div className={cn("emptyState")}>
                  <div className={cn("mailboxIllustration")}>
                    <Image src={mailbox} alt="mailbox" className={cn("mailboxImage")} width={122} height={150} />
                  </div>
                  <p className={cn("emptyMessage")}>
                    아직 도착한 알림이 없어요. <br/>
                    필요한 소식이 생기면 바로 알려드릴게요!
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
                      알림은 받은 날로부터 7일 동안 보관돼요.
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
