import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/HelpList.module.scss";
import { HelpRequestStatus, HelpRequest } from "@/types/helpList"
import { helpRequests } from "@/mocks/helpList";
import { useUserStore } from "@/lib/store/userStore";
import { getPersonalReservation, patchPersonalReservation } from "@/lib/apis/reservation";

const cn = classNames.bind(styles);

const ITEMS_PER_PAGE = 10;

export default function HelpListPage() {
  const router = useRouter();
  const { user, isVerified } = useUserStore();
  const [activeTab, setActiveTab] = useState<"전체" | "대기" | "완료" | "취소">("전체");
  const [visibleItems, setVisibleItems] = useState<number>(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiRequests, setApiRequests] = useState<HelpRequest[]>([]);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // API에서 데이터를 가져오는 함수
  const fetchReservations = useCallback(async (status?: string) => {
    setIsApiLoading(true);
    try {
      // 탭 상태를 API 파라미터로 변환
      let apiStatus = status;
      
      const params = {
        params: {
          reservationStatus: apiStatus && apiStatus !== "전체" ? apiStatus : undefined,
          page: 0,
          size: 10,
        }
      };
      
      console.log('API 요청 파라미터:', params);
      const response = await getPersonalReservation(params);
      
      if (response && response.data) {
        console.log('API 응답 데이터:', response.data);
        const rawData = response.data.content || response.data || [];
        console.log('원본 rawData:', rawData);
        console.log('rawData의 첫 번째 항목:', rawData[0]);
        
        // API 응답 데이터를 HelpRequest 형식으로 매핑
        const mappedData = rawData.map((item: any) => {
          // API 상태를 UI 상태로 변환
          console.log('원본 item의 상태:', item.reservationStatus || item.status);
          let uiStatus = item.reservationStatus || item.status;
          
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
            id: item.id || item.reservationId || Math.random().toString(),
            userId: item.userId || user?.id || '',
            date: item.visitDate ? new Date(item.visitDate).toLocaleDateString('ko-KR') : '',
            dayOfWeek: item.visitDate ? new Date(item.visitDate).toLocaleDateString('ko-KR', { weekday: 'short' }) : '',
            content: item.requirement || item.content || '',
            startTime: formatTime(item.startTime || ''),
            endTime: formatTime(item.endTime || ''),
            status: uiStatus
          };
        });
        
        console.log('매핑된 데이터:', mappedData);
        console.log('매핑된 데이터의 상태들:', mappedData.map((item: any) => item.status));
        setApiRequests(mappedData);
      } else {
        console.log('API 응답이 없거나 빈 데이터');
        setApiRequests([]);
      }
    } catch (error) {
      console.error('예약 목록 조회 실패:', error);
      setApiRequests([]);
    } finally {
      setIsApiLoading(false);
    }
  }, [user?.id]);

  // 탭 변경 시 API 호출
  useEffect(() => {
    if (isVerified) {
      fetchReservations(activeTab);
    }
  }, [activeTab, isVerified, fetchReservations]);

  // 로그인 상태 변경 시 API 호출
  useEffect(() => {
    if (isVerified) {
      fetchReservations(activeTab);
    } else {
      setApiRequests([]);
    }
  }, [isVerified, activeTab, fetchReservations]);

  // API 데이터를 사용하거나, 없으면 목업 데이터 사용
  const userRequests = apiRequests.length > 0 
    ? apiRequests 
    : (user ? helpRequests.filter((request: HelpRequest) => request.userId === user.id) : []);
  
  const filteredRequests = activeTab === "전체" 
    ? userRequests 
    : userRequests.filter((request: HelpRequest) => request.status === activeTab);
  
  console.log('현재 activeTab:', activeTab);
  console.log('userRequests:', userRequests);
  console.log('userRequests의 status들:', userRequests.map(item => item.status));
  console.log('filteredRequests:', filteredRequests);

  const displayedRequests = filteredRequests.slice(0, visibleItems);
  const hasMoreItems = visibleItems < filteredRequests.length;

  const loadMoreItems = useCallback(() => {
    if (isLoading || !hasMoreItems) return;
    
    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredRequests.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMoreItems, filteredRequests.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems && !isLoading) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreItems, hasMoreItems, isLoading]);

  // 탭 변경 시 초기화
  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [activeTab]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: "전체" | "대기" | "완료" | "취소") => {
    setActiveTab(tab);
    setVisibleItems(ITEMS_PER_PAGE);
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
    router.push(`/helpList/${id}`);
  };

  const handleCancelReservation = async (id: string) => {
    if(confirm("예약을 취소하시겠습니까?")) {
      try {
        const response = await patchPersonalReservation(id);
        
        if (response) {
          alert("예약이 취소되었습니다.");
          fetchReservations(activeTab);
        } else {
          alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
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
          {!isApiLoading && displayedRequests.length === 0 && (
            <div className={cn("emptyState")}>
              <p>해당 상태의 예약이 없습니다.</p>
            </div>
          )}
          
          {/* 예약 목록 */}
          {!isApiLoading && displayedRequests.map((request: HelpRequest) => (
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
          
          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className={cn("loadingIndicator")}>
              <div className={cn("spinner")}></div>
              <span>더 많은 도움 요청을 불러오는 중...</span>
            </div>
          )}
          
          {/* 무한 스크롤 감지 요소 */}
          {hasMoreItems && (
            <div ref={observerRef} className={cn("scrollObserver")} />
          )}
          
          {/* 더 이상 로드할 항목이 없을 때 */}
          {!hasMoreItems && displayedRequests.length > 0 && (
            <div className={cn("endMessage")}>
              모든 도움 요청을 불러왔습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
