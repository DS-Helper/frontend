import { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/HelpList.module.scss";
import detailStyles from "@/pages/helpList/[id]/HelpDetail.module.scss";
import { HelpRequestStatus, HelpRequest, ApiReservationData, HelpDetailData } from "@/types/helpList"
import { useUserStore } from "@/lib/store/userStore";
import { getPersonalReservation, patchPersonalReservation, getPersonalReservationDetail } from "@/lib/apis/reservationUser";
import { getOrganizationReservation, patchOrganizationReservation, getOrganizationReservationDetail } from "@/lib/apis/reservationOrg";
import { IoChevronDown } from "react-icons/io5";
import Image from 'next/image';
import mapIcon from "@/public/mapIcon.svg";
import calendarIcon from "@/public/calendarIcon.svg";

const cn = classNames.bind(styles);
const detailCn = classNames.bind(detailStyles);

const ITEMS_PER_PAGE = 10;

export default function HelpListPage() {
  const { user, isVerified, userType } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<"전체" | "대기" | "완료" | "취소">("전체");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiRequests, setApiRequests] = useState<HelpRequest[]>([]);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const userTypeRef = useRef(userType);
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [helpDetail, setHelpDetail] = useState<HelpDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // userType이 변경될 때 ref 업데이트
  useEffect(() => {
    userTypeRef.current = userType;
  }, [userType]);
  
  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // API에서 데이터를 가져오는 함수
  const fetchReservations = useCallback(async (status?: string, page: number = 0, append: boolean = false) => {
    if (append) {
      setIsLoading(true);
    } else {
      setIsApiLoading(true);
    }
    
    try {
      // 탭 상태를 API 파라미터로 변환
      const apiStatus = status;
      
      const params = {
        params: {
          reservationStatus: apiStatus && apiStatus !== "전체" ? apiStatus : undefined,
          page: page,
          size: ITEMS_PER_PAGE,
        }
      };
      
      // userType이 null이거나 undefined인 경우 기본값 처리
      const currentUserType = userTypeRef.current || 'individual';
      
      const response = currentUserType === 'organization' 
        ? await getOrganizationReservation(params)
        : await getPersonalReservation(params);
      
      if (response && response.data) {
        const rawData = response.data.content || response.data || [];
        // const totalPages = response.data.totalPages || 0;
        // const totalElements = response.data.totalElements || 0;
        
        console.log('API 응답 데이터:', response.data);
        console.log('rawData:', rawData);
        
        // 유효한 데이터만 필터링 (personalReservationId 또는 organizationReservationId가 존재하는 항목만)
        const validData = rawData.filter((item: any) => {
          return item && (item.personalReservationId || item.organizationReservationId || item.id);
        });
        
        console.log('validData:', validData);
        
        // API 응답 데이터를 HelpRequest 형식으로 매핑
        const mappedData = validData.map((item: any) => {
          // ID 필드 확인 (개인/기관 구분)
          const reservationId = item.personalReservationId || item.organizationReservationId || item.id;
          
          // userId 필드 확인 (개인/기관 구분)
          const userId = item.reservationHolderId || item.user?.id || item.userId || '';
          
          // API 상태를 UI 상태로 변환
          let uiStatus = item.reservationStatus;
          
          // API 상태를 UI 상태로 변환 (이미 한글이면 그대로 사용)
          if (uiStatus === 'REQUESTED') {
            uiStatus = '대기';
          } else if (uiStatus === 'CANCELED') {
            uiStatus = '취소';
          } else if (uiStatus === 'COMPLETED' || uiStatus === '완료') {
            uiStatus = '완료';
          }
          
          // 시간을 오전/오후 형식으로 변환 (13:00 -> 오후 1:00, 12:00 -> 오후 12:00)
          const formatTime = (time: string) => {
            if (!time) return '';
            const [hours, minutes] = time.split(':').map(Number);
            const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            const period = hours < 12 ? '오전' : '오후';
            return `${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
          };

          // 날짜를 MM.DD 형식으로 변환 (로컬 시간 기준)
          const formatDate = (dateString: string) => {
            if (!dateString) return '';
            // YYYY-MM-DD 형식인 경우 직접 파싱
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = dateString.split('-').map(Number);
              return `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
            }
            // ISO 문자열인 경우 로컬 시간 기준으로 파싱
            const date = new Date(dateString);
            // 로컬 시간 기준으로 날짜 추출
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}.${day}`;
          };

          // 요일 계산 함수 (로컬 시간 기준)
          const getDayOfWeek = (dateString: string) => {
            if (!dateString) return '';
            // YYYY-MM-DD 형식인 경우 직접 파싱
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = dateString.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('ko-KR', { weekday: 'short' });
            }
            // ISO 문자열인 경우 로컬 시간 기준으로 파싱
            return new Date(dateString).toLocaleDateString('ko-KR', { weekday: 'short' });
          };

          return {
            id: reservationId,
            userId: userId,
            date: item.visitDate ? formatDate(item.visitDate) : '',
            dayOfWeek: item.visitDate ? getDayOfWeek(item.visitDate) : '',
            content: item.note || '',
            requirement: item.requirement || '',
            startTime: formatTime(item.startTime),
            endTime: formatTime(item.endTime),
            status: uiStatus
          };
        });
        
        console.log('mappedData:', mappedData);
        
        if (append) {
          // 추가 로딩인 경우 기존 데이터에 추가
          setApiRequests(prev => [...prev, ...mappedData]);
        } else {
          // 새로 로딩인 경우 기존 데이터 교체
          setApiRequests(mappedData);
        }
        
        // 더 이상 페이지가 있는지 확인 - 더 간단한 조건
        const hasMoreData = mappedData.length > 0 && mappedData.length >= ITEMS_PER_PAGE;
        setHasMorePages(hasMoreData);
      } else {
        if (!append) {
          setApiRequests([]);
        }
        setHasMorePages(false);
      }
    } catch (error) {
      console.error('예약 목록 조회 실패:', error);
      if (!append) {
        setApiRequests([]);
      }
      setHasMorePages(false);
    } finally {
      if (append) {
        setIsLoading(false);
      } else {
        setIsApiLoading(false);
      }
    }
  }, []);

  // 로그인 상태 및 탭 변경 시 API 호출 (첫 페이지만)
  useEffect(() => {
    if (isVerified) {
      setCurrentPage(0);
      setHasMorePages(true); // 초기에는 true로 설정
      // 첫 페이지만 로드하여 빠른 초기 렌더링
      fetchReservations(activeTab, 0, false);
    } else {
      setApiRequests([]);
      setCurrentPage(0);
      setHasMorePages(false); // 로그인하지 않은 경우 false
    }
  }, [activeTab, isVerified, fetchReservations]);

  // API 데이터를 사용하거나, 없으면 목업 데이터 사용
  const userRequests = apiRequests.length > 0 
    ? apiRequests 
    : (user ? apiRequests.filter((request: HelpRequest) => request.userId === user.id) : []);
  
  const filteredRequests = activeTab === "전체" 
    ? userRequests 
    : userRequests.filter((request: HelpRequest) => request.status === activeTab);

  const loadMoreItems = useCallback(() => {
    
    if (isLoading || !hasMorePages) {
      return;
    }
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    // 추가 데이터만 로드 (기존 데이터에 추가)
    fetchReservations(activeTab, nextPage, true);
  }, [isLoading, hasMorePages, currentPage, activeTab, fetchReservations]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        
        if (entries[0].isIntersecting && hasMorePages && !isLoading && !isApiLoading) {
          loadMoreItems();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // 더 일찍 트리거되도록 증가
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMoreItems, hasMorePages, isLoading, isApiLoading, currentPage]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: "전체" | "대기" | "완료" | "취소") => {
    setActiveTab(tab);
  };


  // 상세 정보 가져오기
  const fetchReservationDetail = useCallback(async (id: string) => {
    setIsDetailLoading(true);
    try {
      const currentUserType = userType || 'individual';
      
      const response = currentUserType === 'organization' 
        ? await getOrganizationReservationDetail(id)
        : await getPersonalReservationDetail(id);
      
      if (response && response.data) {
        const reservation = response.data;
        
        const reservationId = currentUserType === 'organization' 
          ? reservation.organizationReservationId 
          : (reservation.id || reservation.personalReservationId);
          
        if (!reservation || !reservationId) {
          console.error('예약 데이터가 없거나 형식이 올바르지 않음:', reservation);
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
        
        // 날짜 포맷 함수 (MM.DD 형식, 로컬 시간 기준)
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          // YYYY-MM-DD 형식인 경우 직접 파싱
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-').map(Number);
            return `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
          }
          // ISO 문자열인 경우 로컬 시간 기준으로 파싱
          const date = new Date(dateString);
          // 로컬 시간 기준으로 날짜 추출
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${month}.${day}`;
        };
        
        // 요일 계산 함수 (로컬 시간 기준)
        const getDayOfWeek = (dateString: string) => {
          if (!dateString) return '';
          // YYYY-MM-DD 형식인 경우 직접 파싱
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('ko-KR', { weekday: 'short' });
          }
          // ISO 문자열인 경우 로컬 시간 기준으로 파싱
          return new Date(dateString).toLocaleDateString('ko-KR', { weekday: 'short' });
        };
        
        // 상태 변환 함수
        const convertStatus = (status: string): HelpRequestStatus => {
          if (status === 'REQUESTED' || status === '대기') return '대기';
          if (status === 'CANCELED' || status === '취소') return '취소';
          if (status === 'COMPLETED' || status === '완료') return '완료';
          return '대기';
        };
        
        // 성별 변환 함수
        const convertGender = (gender: string) => {
          if (gender === 'FEMALE' || gender === '여' || gender === '여자') return '여자';
          if (gender === 'MALE' || gender === '남' || gender === '남자') return '남자';
          return gender || "성별 없음";
        };
        
        // API 데이터를 HelpRequest 형식으로 매핑
        const mappedRequest: HelpRequest = {
          id: reservationId,
          userId: currentUserType === 'organization' 
            ? reservation.reservationHolderId 
            : (reservation.user?.id || reservation.userId || reservation.reservationHolderId || ''),
          date: reservation.visitDate ? formatDate(reservation.visitDate) : '',
          dayOfWeek: reservation.visitDate ? getDayOfWeek(reservation.visitDate) : '',
          content: reservation.note || '',
          requirement: reservation.requirement || '',
          startTime: formatTime(reservation.startTime || ''),
          endTime: formatTime(reservation.endTime || ''),
          status: convertStatus(reservation.reservationStatus || '')
        };
        
        setHelpRequest(mappedRequest);
        
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
          note: reservation.note || ""
        };
        
        setHelpDetail(mappedDetail);
        setSelectedReservationId(reservationId);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('예약 상세 조회 실패:', error);
    } finally {
      setIsDetailLoading(false);
    }
  }, [userType]);

  const handleViewDetails = (id: string) => {
    fetchReservationDetail(id);
  };
  
  const handleCloseModal = () => {
    // slide out 애니메이션 시작
    setIsClosing(true);
    
    // 애니메이션 완료 후 실제로 모달 닫기
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setSelectedReservationId(null);
      setHelpRequest(null);
      setHelpDetail(null);
    }, 300); // CSS transition 시간과 동일하게 설정
  };
  
  const handleCancelReservationInModal = async () => {
    if (!selectedReservationId) return;
    
    if(confirm("예약을 취소하시겠습니까?")) {
      try {
        const currentUserType = userType || 'individual';
        
        const response = currentUserType === 'organization' 
          ? await patchOrganizationReservation(selectedReservationId)
          : await patchPersonalReservation(selectedReservationId);
        
        if (response) {
          alert("예약이 취소되었습니다.");
          handleCloseModal();
          // 취소 후 첫 페이지만 다시 로드
          setCurrentPage(0);
          setHasMorePages(true);
          fetchReservations(activeTab, 0, false);
        } else {
          alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
        }
      } catch {
        alert("예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };
  
  const getStatusClass = (status: string): string => {
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
  };

  const handleCancelReservation = async (id: string) => {
    if(confirm("예약을 취소하시겠습니까?")) {
      try {
        const currentUserType = userType || 'individual';
        
        const response = currentUserType === 'organization' 
          ? await patchOrganizationReservation(id)
          : await patchPersonalReservation(id);
        
        if (response) {
          alert("예약이 취소되었습니다.");
          // 취소 후 첫 페이지만 다시 로드 (빠른 새로고침)
          setCurrentPage(0);
          setHasMorePages(true);
          fetchReservations(activeTab, 0, false);
        } else {
          alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
        }
      } catch {
        alert("예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 유저가 로그인하지 않은 경우 안내 메시지 표시
  if (!isVerified) {
    return (
      <div className={cn("helpListPage")}>
        <div className={cn("loginRequired")}>
          <p>로그인이 필요한 서비스입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("helpListPage")}>
      {/* 탭 메뉴 */}
      <nav className={cn("tabNavigation")}>
        <div className={cn("tabContainer")}>
          {(["전체", "대기", "완료", "취소"] as const).map((tab) => (
            <button
              key={tab}
              className={cn("tabButton", { active: activeTab === tab })}
              onClick={() => handleTabChange(tab)}
              disabled={isApiLoading}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* 도움 요청 목록 */}
      <main className={cn("mainContent")}>
        <div className={cn("helpList")}>
          {/* API 로딩 중일 때 */}
          {isApiLoading && (
            <div className={cn("loadingIndicator")}>
              <div className={cn("spinner")}></div>
              <span>예약 목록을 불러오는 중...</span>
            </div>
          )}
          
          {/* 데이터가 없을 때 */}
          {!isApiLoading && filteredRequests.length === 0 && (
            <div className={cn("emptyState")}>
              <p>해당 상태의 예약이 없습니다.</p>
            </div>
          )}
          
          {/* 예약 목록 */}
          {!isApiLoading && filteredRequests.map((request: HelpRequest) => (
            <div key={request.id} className={cn("helpCard")}>
              {/* 날짜 및 상태 */}
              <div className={cn("cardHeader")}>
                <div className={cn("dateInfo")}>
                  <span className={cn("date")}>{request.date}</span>
                  <span className={cn("dayOfWeek")}>{request.dayOfWeek}</span>
                  <span className={cn("statusTag", getStatusClass(request.status))}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* 내용 */}
              <div className={cn("cardContent")}>
                <p className={cn("contentText")}>{request.requirement}</p>
                {user?.type === "기업" && (
                  <div className={cn("organizationInfo")}>
                    <span className={cn("organizationTag")}>기관 요청</span>
                  </div>
                )}
              </div>

              {/* 시간 정보 */}
              <div className={cn("timeInfo")}>
                <span className={cn("clockIcon")}>🕐</span>
                <span className={cn("timeRange")}>
                  {request.startTime} ~ {request.endTime}
                </span>
              </div>

              {/* 액션 버튼 */}
              <div className={cn("cardActions")}>
                <button
                  className={cn("viewDetailsButton")}
                  onClick={() => handleViewDetails(request.id)}
                >
                  상세 보기
                </button>
                {request.status === "대기" && (
                  <button
                    className={cn("cancelButton")}
                    onClick={() => handleCancelReservation(request.id)}
                  >
                    예약 취소
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* 로딩 인디케이터 (추가 데이터 로딩 중) */}
          {isLoading && (
            <div className={cn("loadingIndicator")}>
              <div className={cn("spinner")}></div>
              <span>더 많은 예약을 불러오는 중...</span>
            </div>
          )}
          
          {/* 무한 스크롤 감지 요소 */}
          {hasMorePages && !isApiLoading && (
            <div 
              ref={observerRef} 
              className={cn("scrollObserver")} 
              style={{ 
                height: '50px', 
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px'
              }}
            >
              스크롤 감지 영역 (더 많은 데이터 로딩 중...)
            </div>
          )}
          
          {/* 더 이상 로드할 항목이 없을 때 */}
          {!hasMorePages && filteredRequests.length > 0 && (
            <div className={cn("endMessage")}>
              모든 도움 요청을 불러왔습니다.
            </div>
          )}
        </div>
      </main>
      
      {/* 상세보기 모달 */}
      {isModalOpen && (
        <div 
          className={detailCn("modalOverlay", { visible: isModalOpen && !isClosing })} 
          onClick={handleCloseModal}
        >
          <div 
            className={detailCn("modalContent", { closing: isClosing })} 
            onClick={(e) => e.stopPropagation()}
          >
            {isDetailLoading ? (
              <div className={cn("loadingIndicator")}>
                <div className={cn("spinner")}></div>
                <span>상세 정보를 불러오는 중...</span>
              </div>
            ) : helpRequest && helpDetail ? (
              <>
                {/* 헤더 */}
                <div className={detailCn("header", getStatusClass(helpRequest.status))}>
                  <div className={detailCn("statusContainer")}>
                    <span className={detailCn("status", getStatusClass(helpRequest.status))}>
                      {helpRequest.status}
                    </span>
                  </div>
                  <button className={detailCn("closeButton")} onClick={handleCloseModal}>
                    <IoChevronDown size={20} className={detailCn("chevronIcon", getStatusClass(helpRequest.status))} />
                  </button>
                </div>

                {/* 메인 콘텐츠 */}
                <div className={detailCn("mainContent")}>
                  {/* 날짜 및 시간 */}
                  <section className={detailCn("infoSection", "infoDate")}>
                    <h3 className={detailCn("sectionTitle")}>날짜 및 시간</h3>
                    <div className={detailCn("infoRow")}>
                      <span className={detailCn("icon")}>
                        <Image width={30} height={30} alt="예약 날짜" src={calendarIcon} />
                      </span>
                      <span className={detailCn("infoText")}>
                        {helpRequest.date} ({helpRequest.dayOfWeek}) {helpRequest.startTime} ~ {helpRequest.endTime}
                      </span>
                    </div>
                    <div className={detailCn("infoRow")}>
                      <span className={detailCn("icon")}>
                        <Image width={30} height={30} alt="예약 시간" src={mapIcon} />
                      </span>
                      <span className={detailCn("infoText")}>
                        {helpDetail.location || "위치 정보 없음"}
                      </span>
                    </div>
                  </section>

                  {/* 신청자 정보 */}
                  <section className={detailCn("infoSection")}>
                    <h3 className={detailCn("sectionTitle")}>신청자 정보</h3>
                    {user?.type === "기업" && helpDetail.applicantInfo?.organizationName && (
                      <div className={detailCn("infoRow")}>
                        <span className={detailCn("label")}>기관명 :</span>
                        <span className={detailCn("value")}>{helpDetail.applicantInfo.organizationName}</span>
                      </div>
                    )}
                    <div className={detailCn("infoRow", "nameRow")}>
                      <span className={detailCn("label")}>이름 :</span>
                      <span className={detailCn("value")}>
                        {helpDetail.applicantInfo?.name && helpDetail.applicantInfo.name.trim() 
                          ? helpDetail.applicantInfo.name 
                          : "이름 없음"}
                      </span>
                    </div>
                    <div className={detailCn("infoRow", "contactRow")}>
                      <span className={detailCn("label")}>연락처 :</span>
                      <span className={detailCn("value")}>
                        {helpDetail.applicantInfo?.contact && helpDetail.applicantInfo.contact.trim() 
                          ? helpDetail.applicantInfo.contact 
                          : "연락처 없음"}
                      </span>
                    </div>
                  </section>

                  {/* 도움 요청 내용 */}
                  <section className={detailCn("infoSection")}>
                    <h3 className={detailCn("sectionTitle")}>도움 요청 내용</h3>
                    <div className={detailCn("contentText")}>
                      {helpDetail.requirement}
                    </div>
                  </section>

                  {/* 도움 받는 사람의 성별/수 */}
                  <section className={detailCn("infoSection")}>
                    <h3 className={detailCn("sectionTitle")}>도움 받는 사람의 성별 / 수</h3>
                    <div className={detailCn("infoRow")}>
                      <span className={detailCn("value")}>
                        {helpDetail.recipientInfo?.gender || "성별 없음"} / {helpDetail.recipientInfo?.count || 0}
                      </span>
                    </div>
                  </section>

                  {/* 특이사항 */}
                  <section className={detailCn("infoSection")}>
                    <h3 className={detailCn("sectionTitle")}>특이사항</h3>
                    <div className={detailCn("contentText")}>
                      {helpRequest.note && helpRequest.note.trim() 
                        ? helpRequest.note 
                        : "특이사항 없음"}
                    </div>
                  </section>

                  {/* 취소된 경우 거절사유 표시 */}
                  {helpRequest.status === "취소" && (
                    <section className={detailCn("infoSection")}>
                      <h3 className={detailCn("sectionTitle")}>거절사유</h3>
                      <div className={detailCn("contentText", "rejectionReason")}>
                        {helpDetail.rejectionReason || "거절사유 없음"}
                      </div>
                    </section>
                  )}
                </div>

                {/* 액션 버튼 */}
                {helpRequest.status === "대기" && (
                  <div className={detailCn("actionSection")}>
                    <button 
                      className={detailCn("cancelButton")} 
                      onClick={handleCancelReservationInModal}
                    >
                      예약 취소하기
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
