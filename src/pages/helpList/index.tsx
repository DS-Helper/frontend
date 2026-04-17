import { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames/bind";
import detailStyles from "";
import styles from "../../styles/HelpList.module.scss";
import { HelpRequestStatus } from "@/types/helpList"
import { useUserStore } from "@/lib/store/userStore";
import { getPersonalReservation, patchPersonalReservation } from "@/lib/apis/reservationUser";
import { getOrganizationReservation, patchOrganizationReservation } from "@/lib/apis/reservationOrg";
import { IoChevronDown } from "react-icons/io5";
import Image from 'next/image';
import mapIcon from "@/public/mapIcon.svg";
import calendarIcon from "@/public/calendarIcon.svg";
import clockIcon from "@/public/HelpListClockIcon.svg";
 
const cn = classNames.bind(styles);
const detailCn = classNames.bind(detailStyles);

const ITEMS_PER_PAGE = 10;

export default function HelpListPage() {
  const { user, isVerified, userType } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<"?�체" | "?��? | "?�료" | "취소">("?�체");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiRequests, setApiRequests] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const userTypeRef = useRef(userType);
  
  // 모달 관???�태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [reservationDetail, setReservationDetail] = useState<any | null>(null);

  // userType??변경될 ??ref ?�데?�트
  useEffect(() => {
    userTypeRef.current = userType;
  }, [userType]);
  
  // 모달???�릴 ??body ?�크�?방�?
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

  // API?�서 ?�이?��? 가?�오???�수
  const fetchReservations = useCallback(async (status?: string, page: number = 0, append: boolean = false) => {
    if (append) {
      setIsLoading(true);
    } else {
      setIsApiLoading(true);
    }
    
    try {
      // ???�태�?API ?�라미터�?변??
      const apiStatus = status;
      
      const params = {
        params: {
          reservationStatus: apiStatus && apiStatus !== "?�체" ? apiStatus : undefined,
          page: page,
          size: ITEMS_PER_PAGE,
        }
      };
      
      // userType??null?�거??undefined??경우 기본�?처리
      const currentUserType = userTypeRef.current || 'individual';
      
      const response = currentUserType === 'organization' 
        ? await getOrganizationReservation(params)
        : await getPersonalReservation(params);
      
      if (response && response.data) {
        const rawData = response.data.content || response.data || [];
        
        // ?�효???�이?�만 ?�터�?(personalReservationId ?�는 organizationReservationId가 존재?�는 ??���?
        const validData = rawData.filter((item: any) => {
          return item && (item.personalReservationId || item.organizationReservationId || item.id);
        });
        
        if (append) {
          // 추�? 로딩??경우 기존 ?�이?�에 추�?
          setApiRequests(prev => [...prev, ...validData]);
        } else {
          // ?�로 로딩??경우 기존 ?�이??교체
          setApiRequests(validData);
        }
        
        // ???�상 ?�이지가 ?�는지 ?�인
        const hasMoreData = validData.length > 0 && validData.length >= ITEMS_PER_PAGE;
        setHasMorePages(hasMoreData);
      } else {
        if (!append) {
          setApiRequests([]);
        }
        setHasMorePages(false);
      }
    } catch (error) {
      console.error('?�약 목록 조회 ?�패:', error);
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

  // 로그???�태 �???변�???API ?�출 (�??�이지�?
  useEffect(() => {
    if (isVerified) {
      setCurrentPage(0);
      setHasMorePages(true); // 초기?�는 true�??�정
      // �??�이지�?로드?�여 빠른 초기 ?�더�?
      fetchReservations(activeTab, 0, false);
    } else {
      setApiRequests([]);
      setCurrentPage(0);
      setHasMorePages(false); // 로그?�하지 ?��? 경우 false
    }
  }, [activeTab, isVerified, fetchReservations]);

  // ?�태 변???�수
  const convertStatus = (status: string): HelpRequestStatus => {
    if (status === 'REQUESTED' || status === '?��?) return '?��?;
    if (status === 'CANCELED' || status === '취소') return '취소';
    if (status === 'COMPLETED' || status === '?�료') return '?�료';
    return '?��?;
  };

  // ?�간 ?�맷 ?�수 (?�전/?�후 ?�식)
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours < 12 ? '?�전' : '?�후';
    return `${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
  };

  // ?�짜 ?�맷 ?�수 (MM.DD ?�식, 로컬 ?�간 기�?)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // YYYY-MM-DD ?�식??경우 직접 ?�싱
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [, month, day] = dateString.split('-').map(Number);
      return `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
    }
    // ISO 문자?�인 경우 로컬 ?�간 기�??�로 ?�싱
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  // ?�일 계산 ?�수 (로컬 ?�간 기�?)
  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return '';
    // YYYY-MM-DD ?�식??경우 직접 ?�싱
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('ko-KR', { weekday: 'short' });
    }
    // ISO 문자?�인 경우 로컬 ?�간 기�??�로 ?�싱
    return new Date(dateString).toLocaleDateString('ko-KR', { weekday: 'short' });
  };

  // ?�터링된 ?�청 목록
  const filteredRequests = activeTab === "?�체" 
    ? apiRequests 
    : apiRequests.filter((request: any) => {
        const status = convertStatus(request.reservationStatus || '');
        return status === activeTab;
      });

  const loadMoreItems = useCallback(() => {
    
    if (isLoading || !hasMorePages) {
      return;
    }
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    // 추�? ?�이?�만 로드 (기존 ?�이?�에 추�?)
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
        rootMargin: '200px' // ???�찍 ?�리거되?�록 증�?
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMoreItems, hasMorePages, isLoading, isApiLoading, currentPage]);

  // ??변�??�들??
  const handleTabChange = (tab: "?�체" | "?��? | "?�료" | "취소") => {
    setActiveTab(tab);
  };


  // ?�세 ?�보 가?�오�?(목록 ?�이?�에??찾기)
  const handleViewDetails = (id: string) => {
    // 목록?�서 ?�당 ID???�약 ?�이??찾기
    const reservation = apiRequests.find((item: any) => {
      const itemId = item.personalReservationId || item.organizationReservationId;
      return itemId === id;
    });
    
    if (!reservation) {
      console.error('?�약 ?�이?��? 찾을 ???�습?�다:', id);
      return;
    }
    
    const currentUserType = userType || 'individual';
    const reservationId = currentUserType === 'organization' 
      ? reservation.organizationReservationId 
      : reservation.personalReservationId;
    
    if (!reservationId) {
      console.error('?�약 ID�?찾을 ???�습?�다:', reservation);
      return;
    }
    
    setReservationDetail(reservation);
    setIsModalOpen(true);
    // 모달 ?�기 ?�니메이?�을 ?�해 ?�간??지????visible ?�태�??�환
    setTimeout(() => {
      setIsOpening(true);
    }, 10);
  };
  
  const handleCloseModal = () => {
    // slide out ?�니메이???�작
    setIsClosing(true);
    setIsOpening(false);
    
    // ?�니메이???�료 ???�제�?모달 ?�기
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setIsOpening(false);
      setReservationDetail(null);
    }, 300); // CSS transition ?�간�??�일?�게 ?�정
  };
  
  const handleCancelReservationInModal = async () => {
    if (!reservationDetail) return;
    
    const currentUserType = userType || 'individual';
    
    // personalReservationId ?�는 organizationReservationId�?직접 ?�용
    let cancelId: string | undefined;
    if (currentUserType === 'organization') {
      cancelId = reservationDetail.organizationReservationId;
    } else {
      cancelId = reservationDetail.personalReservationId;
    }
    
    if (!cancelId) {
      console.error('취소???�약 ID�?찾을 ???�습?�다:', reservationDetail);
      return;
    }
    
    console.log('취소???�약 ID:', cancelId);
    console.log('reservationDetail:', reservationDetail);
    
    if(confirm("?�약??취소?�시겠습?�까?")) {
      try {
        const response = currentUserType === 'organization' 
          ? await patchOrganizationReservation(cancelId)
          : await patchPersonalReservation(cancelId);
        
        if (response) {
          alert("?�약??취소?�었?�니??");
          handleCloseModal();
          // 취소 ??�??�이지�??�시 로드
          setCurrentPage(0);
          setHasMorePages(true);
          fetchReservations(activeTab, 0, false);
        } else {
          alert("?�약 취소???�패?�습?�다. ?�시 ?�도?�주?�요.");
        }
      } catch {
        alert("?�약 취소 �??�류가 발생?�습?�다. ?�시 ?�도?�주?�요.");
      }
    }
  };
  
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "?��?:
        return "scheduled";
      case "?�료":
        return "completed";
      case "취소":
        return "cancelled";
      default:
        return "";
    }
  };

  const handleCancelReservation = async (id: string) => {
    if(confirm("?�약??취소?�시겠습?�까?")) {
      try {
        const currentUserType = userType || 'individual';
        
        const response = currentUserType === 'organization' 
          ? await patchOrganizationReservation(id)
          : await patchPersonalReservation(id);
        
        if (response) {
          alert("?�약??취소?�었?�니??");
          // 취소 ??�??�이지�??�시 로드 (빠른 ?�로고침)
          setCurrentPage(0);
          setHasMorePages(true);
          fetchReservations(activeTab, 0, false);
        } else {
          alert("?�약 취소???�패?�습?�다. ?�시 ?�도?�주?�요.");
        }
      } catch {
        alert("?�약 취소 �??�류가 발생?�습?�다. ?�시 ?�도?�주?�요.");
      }
    }
  };

  // ?��?가 로그?�하지 ?��? 경우 ?�내 메시지 ?�시
  if (!isVerified) {
    return (
      <div className={cn("helpListPage")}>
        <div className={cn("loginRequired")}>
          <p>로그?�이 ?�요???�비?�입?�다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("helpListPage")}>
      {/* ??메뉴 */}
      <nav className={cn("tabNavigation")}>
        <div className={cn("tabContainer")}>
          {(["?�체", "?��?, "?�료", "취소"] as const).map((tab) => (
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

      {/* ?��? ?�청 목록 */}
      <main className={cn("mainContent")}>
        <div className={cn("helpList")}>
          {/* API 로딩 중일 ??*/}
          {isApiLoading && (
            <div className={cn("loadingIndicator")}>
              <div className={cn("spinner")}></div>
              <span>?�약 목록??불러?�는 �?..</span>
            </div>
          )}
          
          {/* ?�이?��? ?�을 ??*/}
          {!isApiLoading && filteredRequests.length === 0 && (
            <div className={cn("emptyState")}>
              <p>?�약???�습?�다.</p>
            </div>
          )}
          
          {/* ?�약 목록 */}
          {!isApiLoading && filteredRequests.map((request: any) => {
            // personalReservationId�??�선?�으�??�용
            const reservationId = request.personalReservationId || request.organizationReservationId;
            const status = convertStatus(request.reservationStatus || '');
            
            if (!reservationId) return null;
            
            return (
              <div key={reservationId} className={cn("helpCard")}>
                {/* ?�짜 �??�태 */}
                <div className={cn("cardHeader")}>
                  <div className={cn("dateInfo")}>
                    <span className={cn("date")}>{request.visitDate ? formatDate(request.visitDate) : ''}</span>
                    <span className={cn("dayOfWeek")}>{request.visitDate ? getDayOfWeek(request.visitDate) : ''}</span>
                    <span className={cn("statusTag", getStatusClass(status))}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* ?�용 */}
                <div className={cn("cardContent")}>
                  <p className={cn("contentText")}>{request.requirement || ''}</p>
                  {user?.type === "기업" && (
                    <div className={cn("organizationInfo")}>
                      <span className={cn("organizationTag")}>기�? ?�청</span>
                    </div>
                  )}
                </div>

                {/* ?�간 ?�보 */}
                <div className={cn("timeInfo")}>
                  <span className={cn("clockIcon")}>
                    <Image width={24} height={24} alt="?�계" src={clockIcon} />
                  </span>
                  <span className={cn("timeRange")}>
                    {formatTime(request.startTime || '')} ~ {formatTime(request.endTime || '')}
                  </span>
                </div>

                {/* ?�션 버튼 */}
                <div className={cn("cardActions")}>
                  <button
                    className={cn("viewDetailsButton")}
                    onClick={() => handleViewDetails(reservationId)}
                  >
                    ?�세 보기
                  </button>
                  {status === "?��? && (
                    <button
                      className={cn("cancelButton")}
                      onClick={() => handleCancelReservation(reservationId)}
                    >
                      ?�약 취소
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* 로딩 ?�디케?�터 (추�? ?�이??로딩 �? */}
          {isLoading && (
            <div className={cn("loadingIndicator")}>
              <div className={cn("spinner")}></div>
              <span>??많�? ?�약??불러?�는 �?..</span>
            </div>
          )}
          
          {/* 무한 ?�크�?감�? ?�소 */}
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
              ?�크�?감�? ?�역 (??많�? ?�이??로딩 �?..)
            </div>
          )}
        </div>
      </main>
      
      {/* ?�세보기 모달 */}
      {isModalOpen && (
        <div 
          className={detailCn("modalOverlay", { visible: isOpening && !isClosing })} 
          onClick={handleCloseModal}
        >
          <div 
            className={detailCn("modalContent", { closing: isClosing, opening: isOpening && !isClosing })} 
            onClick={(e) => e.stopPropagation()}
          >
            {reservationDetail ? (() => {
              const status = convertStatus(reservationDetail.reservationStatus || '');
              const convertGender = (gender: string) => {
                if (gender === 'FEMALE' || gender === '?? || gender === '?�자') return '?�자';
                if (gender === 'MALE' || gender === '?? || gender === '?�자') return '?�자';
                return gender || "?�별 ?�음";
              };
              
              return (
                <>
                  {/* ?�더 */}
                  <div className={detailCn("header", getStatusClass(status))}>
                    <div className={detailCn("statusContainer")}>
                      <span className={detailCn("status", getStatusClass(status))}>
                        {status}
                      </span>
                    </div>
                    <button className={detailCn("closeButton")} onClick={handleCloseModal}>
                      <IoChevronDown size={20} className={detailCn("chevronIcon", getStatusClass(status))} />
                    </button>
                  </div>

                  {/* 메인 콘텐�?*/}
                  <div className={detailCn("mainContent")}>
                    <section className={detailCn("infoSection", "infoDate")}>
                      <h3 className={detailCn("sectionTitle")}>?�짜 �??�간</h3>
                      <div className={detailCn("infoRow")}>
                        <span className={detailCn("icon")}>
                          <Image width={30} height={30} alt="?�약 ?�짜" src={calendarIcon} />
                        </span>
                        <span className={detailCn("infoText")}>
                          {reservationDetail.visitDate ? formatDate(reservationDetail.visitDate) : ''} ({reservationDetail.visitDate ? getDayOfWeek(reservationDetail.visitDate) : ''}) {formatTime(reservationDetail.startTime || '')} ~ {formatTime(reservationDetail.endTime || '')}
                        </span>
                      </div>
                      <div className={detailCn("infoRow")}>
                        <span className={detailCn("icon")}>
                          <Image width={30} height={30} alt="?�약 ?�간" src={mapIcon} />
                        </span>
                        <span className={detailCn("infoText")}>
                          {reservationDetail.address || "?�치 ?�보 ?�음"}
                        </span>
                      </div>
                    </section>

                    {/* ?�청???�보 */}
                    <section className={detailCn("infoSection")}>
                      <h3 className={detailCn("sectionTitle")}>?�청???�보</h3>
                      {user?.type === "기업" && reservationDetail.organizationName && (
                        <div className={detailCn("infoRow")}>
                          <span className={detailCn("label")}>기�?�?:</span>
                          <span className={detailCn("value")}>{reservationDetail.organizationName}</span>
                        </div>
                      )}
                      <div className={detailCn("infoRow", "nameRow")}>
                        <span className={detailCn("label")}>?�름 :</span>
                        <span className={detailCn("value")}>
                          {(reservationDetail.reservationHolder 
                            || reservationDetail.name 
                            || reservationDetail.userName 
                            || reservationDetail.user?.name
                            || "?�름 ?�음").trim() || "?�름 ?�음"}
                        </span>
                      </div>
                      <div className={detailCn("infoRow", "contactRow")}>
                        <span className={detailCn("label")}>?�락�?:</span>
                        <span className={detailCn("value")}>
                          {(reservationDetail.reservationPhoneNumber 
                            || reservationDetail.phoneNumber 
                            || reservationDetail.phone
                            || "?�락�??�음").trim() || "?�락�??�음"}
                        </span>
                      </div>
                    </section>

                    {/* ?��? ?�청 ?�용 */}
                    <section className={detailCn("infoSection")}>
                      <h3 className={detailCn("sectionTitle")}>?��? ?�청 ?�용</h3>
                      <div className={detailCn("contentText")}>
                        {reservationDetail.requirement || ''}
                      </div>
                    </section>

                    {/* ?��? 받는 ?�람???�별/??*/}
                    <section className={detailCn("infoSection")}>
                      <h3 className={detailCn("sectionTitle")}>?��? 받는 ?�람???�별 / ??/h3>
                      <div className={detailCn("infoRow")}>
                        <span className={detailCn("value")}>
                          {convertGender(reservationDetail.recipientGender || '')} / {reservationDetail.recipientNumber || 0}
                        </span>
                      </div>
                    </section>

                    {/* ?�이?�항 */}
                    <section className={detailCn("infoSection")}>
                      <h3 className={detailCn("sectionTitle")}>?�이?�항</h3>
                      <div className={detailCn("contentText")}>
                        {reservationDetail.note && reservationDetail.note.trim() 
                          ? reservationDetail.note
                          : "?�이?�항 ?�음"}
                      </div>
                    </section>

                    {/* 취소??경우 거절?�유 ?�시 */}
                    {status === "취소" && (
                      <section className={detailCn("infoSection")}>
                        <h3 className={detailCn("sectionTitle")}>거절?�유</h3>
                        <div className={detailCn("contentText", "rejectionReason")}>
                          {reservationDetail.rejectionReason || "거절?�유 ?�음"}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* ?�션 버튼 */}
                  {status === "?��? && (
                    <div className={detailCn("actionSection")}>
                      <button 
                        className={detailCn("cancelButton")} 
                        onClick={handleCancelReservationInModal}
                      >
                        ?�약 취소?�기
                      </button>
                    </div>
                  )}
                </>
              );
            })() : null}
          </div>
        </div>
      )}
    </div>
  );
}
