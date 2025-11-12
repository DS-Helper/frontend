'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import classNames from "classnames/bind";
import styles from "./HelpDetail.module.scss";
import { getPersonalReservationDetail, patchPersonalReservation } from "@/lib/apis/reservationUser";
import { getOrganizationReservationDetail, patchOrganizationReservation } from "@/lib/apis/reservationOrg";
import { useUserStore } from "@/lib/store/userStore";
import { HelpRequest, HelpDetailData, HelpRequestStatus } from "@/types/helpList";
import { IoChevronDown } from "react-icons/io5";
import Image from 'next/image';

import mapIcon from "@/public/mapIcon.svg"
import calendarIcon from "@/public/calendarIcon.svg"

const cn = classNames.bind(styles);

export default function HelpDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isVerified, userType } = useUserStore();
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [helpDetail, setHelpDetail] = useState<HelpDetailData | null>(null);

  useEffect(() => {
    if (router.isReady && id && isVerified) {
      // API에서 데이터 가져오기
      const fetchReservationDetail = async () => {
        try {
          const currentUserType = userType || 'individual';
          
          // 개별 예약 상세 조회 API 사용
          const response = currentUserType === 'organization' 
            ? await getOrganizationReservationDetail(id as string)
            : await getPersonalReservationDetail(id as string);
          
          if (response && response.data) {
            const reservation = response.data;
            
            // reservation 데이터 존재 여부 확인 (기관/개인 구분)
            const reservationId = currentUserType === 'organization' 
              ? reservation.organizationReservationId 
              : (reservation.id || reservation.personalReservationId);
              
            if (!reservation || !reservationId) {
              console.error('예약 데이터가 없거나 형식이 올바르지 않음:', reservation);
              console.error('예상된 ID 필드들:', {
                id: reservation?.id,
                personalReservationId: reservation?.personalReservationId,
                organizationReservationId: reservation?.organizationReservationId
              });
              router.push('/helpList');
              return;
            }
            
            // 시간 포맷 함수 (오전/오후 형식)
            const formatTime = (time: string) => {
              if (!time) return '';
              const [hours, minutes] = time.split(':').map(Number);
              const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              const period = hours < 12 ? '오전' : '오후';
              return `${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
            };

            // 날짜 포맷 함수 (MM.DD 형식)
            const formatDate = (dateString: string) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${month}.${day}`;
            };

            // 상태 변환 함수
            const convertStatus = (status: string): HelpRequestStatus => {
              if (status === 'REQUESTED' || status === '대기') return '대기';
              if (status === 'CANCELED' || status === '취소') return '취소';
              if (status === 'COMPLETED' || status === '완료') return '완료';
              return '대기';
            };

            // API 데이터를 HelpRequest 형식으로 매핑
            const mappedRequest: HelpRequest = {
              id: reservationId,
              userId: currentUserType === 'organization' 
                ? reservation.reservationHolderId 
                : (reservation.user?.id || reservation.userId || reservation.reservationHolderId || ''),
              date: reservation.visitDate ? formatDate(reservation.visitDate) : '',
              dayOfWeek: reservation.visitDate ? new Date(reservation.visitDate).toLocaleDateString('ko-KR', { weekday: 'short' }) : '',
              content: reservation.requirement || '',
              startTime: formatTime(reservation.startTime || ''),
              endTime: formatTime(reservation.endTime || ''),
              status: convertStatus(reservation.reservationStatus || '')
            };
            
            setHelpRequest(mappedRequest);
            
            // 성별 변환 함수
            const convertGender = (gender: string) => {
              if (gender === 'FEMALE' || gender === '여' || gender === '여자') return '여자';
              if (gender === 'MALE' || gender === '남' || gender === '남자') return '남자';
              return gender || "성별 없음";
            };

            // 상세 정보를 API 데이터로 구성
            const mappedDetail: HelpDetailData = {
              id: reservationId,
              userId: currentUserType === 'organization' 
                ? reservation.reservationHolderId 
                : (reservation.user?.id || reservation.userId || reservation.reservationHolderId || ''),
              location: reservation.address || "위치 정보 없음",
              applicantInfo: {
                // 개인 예약과 기관 예약 모두 reservationHolder를 우선 사용
                name: reservation.reservationHolder 
                  || reservation.name 
                  || reservation.userName 
                  || reservation.user?.name
                  || "이름 없음",
                // 개인 예약과 기관 예약 모두 reservationPhoneNumber를 우선 사용
                contact: reservation.reservationPhoneNumber 
                  || reservation.phoneNumber 
                  || reservation.phone
                  || "연락처 없음",
                organizationName: currentUserType === 'organization' 
                  ? reservation.organizationName 
                  : ""
              },
              recipientInfo: {
                gender: convertGender(reservation.recipientGender || ''),
                count: reservation.recipientNumber || 1
              },
              rejectionReason: reservation.rejectionReason || "", 
              specialNotes: reservation.specialNotes 
                || reservation.specialNote 
                || reservation.note
                || reservation.notes
                || ""
            };
            
            setHelpDetail(mappedDetail);
          } else {
            console.error('API 응답이 없거나 데이터가 없음:', response);
            router.push('/helpList');
          }
        } catch {
          console.error('예약 상세 조회 실패');
          router.push('/helpList');
        }
      };
      
      fetchReservationDetail();
    }
  }, [router.isReady, id, isVerified, userType, router]);

  const handleClose = () => {
    router.back();
  };

  const handleCancelReservation = async () => {
    if (confirm("예약을 취소하시겠습니까?")) {
      try {
        const currentUserType = userType || 'individual';
        
        const response = currentUserType === 'organization' 
          ? await patchOrganizationReservation(id as string)
          : await patchPersonalReservation(id as string);
        
        if (response) {
          alert("예약이 취소되었습니다.");
          // 취소 후 목록 페이지로 이동
          router.push('/helpList');
        } else {
          alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
        }
      } catch {
        alert("예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 라우터가 준비되지 않은 경우 로딩 표시
  if (!router.isReady) {
    return <div>Loading...</div>;
  }

  // id가 없는 경우
  if (!id) {
    router.back();
    return null;
  }

  // 유저가 로그인하지 않은 경우
  if (!isVerified) {
    router.push('/login');
    return null;
  }

  if (!helpRequest || !helpDetail) {
    return <div>데이터를 불러오는 중...</div>;
  }

  return (
    <div className={cn("helpDetailPage")}>
      <div className={cn("pageContent")}>
        {/* 헤더 */}
        <div className={cn("header", getStatusClass(helpRequest.status))}>
          <div className={cn("statusContainer")}>
            <span className={cn("status", getStatusClass(helpRequest.status))}>
              {helpRequest.status}
            </span>
          </div>
          <button className={cn("backButton")} onClick={handleClose}>
            <IoChevronDown size={20} className={cn("status", getStatusClass(helpRequest.status))} />
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
            {user?.type === "기업" && helpDetail?.applicantInfo?.organizationName && (
              <div className={cn("infoRow")}>
                <span className={cn("label")}>기관명 :</span>
                <span className={cn("value")}>{helpDetail.applicantInfo.organizationName}</span>
              </div>
            )}
            <div className={cn("infoRow", "nameRow")}>
              <span className={cn("label")}>이름 :</span>
              <span className={cn("value")}>
                {helpDetail?.applicantInfo?.name && helpDetail.applicantInfo.name.trim() 
                  ? helpDetail.applicantInfo.name 
                  : "이름 없음"}
              </span>
            </div>
            <div className={cn("infoRow", "contactRow")}>
              <span className={cn("label")}>연락처 :</span>
              <span className={cn("value")}>
                {helpDetail?.applicantInfo?.contact && helpDetail.applicantInfo.contact.trim() 
                  ? helpDetail.applicantInfo.contact 
                  : "연락처 없음"}
              </span>
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
            <h3 className={cn("sectionTitle")}>도움 받는 사람의 성별 / 수</h3>
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
              {helpDetail?.specialNotes && helpDetail.specialNotes.trim() 
                ? helpDetail.specialNotes 
                : "특이사항 없음"}
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
        {helpRequest.status === "대기" && (
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
    case "대기":
      return "scheduled";
    case "완료":
      return "completed";
    case "취소":
      return "cancelled";
    default:
      return "";
  }
}
