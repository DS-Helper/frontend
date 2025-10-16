import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/HelpList.module.scss";
import { HelpRequestStatus, HelpRequest, ApiReservationData } from "@/types/helpList"
import { useUserStore } from "@/lib/store/userStore";
import { getPersonalReservation, patchPersonalReservation } from "@/lib/apis/reservationUser";
import { getOrganizationReservation, patchOrganizationReservation } from "@/lib/apis/reservationOrg";

const cn = classNames.bind(styles);

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
      const currentUserType = userType || 'individual';
      
      const response = currentUserType === 'organization' 
        ? await getOrganizationReservation(params)
        : await getPersonalReservation(params);
      
      if (response && response.data) {
        const rawData = response.data.content || response.data || [];
        const totalPages = response.data.totalPages || 0;
        const totalElements = response.data.totalElements || 0;
        
        // API 응답 데이터를 HelpRequest 형식으로 매핑
        const mappedData = rawData.map((item: ApiReservationData) => {
          // API 상태를 UI 상태로 변환
          let uiStatus = item.reservationStatus;
          
          // API 상태를 UI 상태로 변환
          if (uiStatus === 'REQUESTED') {
            uiStatus = '대기';
          } else if (uiStatus === 'CANCELED') {
            uiStatus = '취소';
          }
          
          // 시간 포맷에서 초 단위 제거 (12:30:00 -> 12:30)
          const formatTime = (time: string) => {
            if (!time) return '';
            return time.split(':').slice(0, 2).join(':');
          };

          return {
            id: item.id,
            userId: item.user.id,
            date: item.visitDate ? new Date(item.visitDate).toLocaleDateString('ko-KR') : '',
            dayOfWeek: item.visitDate ? new Date(item.visitDate).toLocaleDateString('ko-KR', { weekday: 'short' }) : '',
            content: item.requirement || '',
            startTime: formatTime(item.startTime),
            endTime: formatTime(item.endTime),
            status: uiStatus
          };
        });
        
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
  }, [userType]);

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

  const getStatusColor = (status: HelpRequestStatus) => {
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

  const handleViewDetails = (id: string) => {
    window.location.href = `/helpList/${id}`;
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
                </div>
                <span className={cn("statusTag", getStatusColor(request.status))}>
                  {request.status}
                </span>
              </div>

              {/* 내용 */}
              <div className={cn("cardContent")}>
                <p className={cn("contentText")}>{request.content}</p>
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
    </div>
  );
}
