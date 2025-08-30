import { useState } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/HelpList.module.scss";
import { HelpRequestStatus, HelpRequest };

const cn = classNames.bind(styles);

export default function HelpListPage() {
  const [activeTab, setActiveTab] = useState<"전체" | "예정" | "완료" | "취소">("전체");

  // 샘플 데이터 (이미지 기반)
  const helpRequests: HelpRequest[] = [
    {
      id: "1",
      date: "6.11",
      dayOfWeek: "수",
      status: "예정",
      content: "저희 할아버지와 동사무소에 같이 가주세요. 문서 작성도 조금 도와주시면 감사하겠습니다.",
      startTime: "오전 10:00",
      endTime: "오후 1:00"
    },
    {
      id: "2",
      date: "6.10",
      dayOfWeek: "화",
      status: "완료",
      content: "전등 교체 좀 해주세요",
      startTime: "오후 1:00",
      endTime: "오후 3:00"
    },
    {
      id: "3",
      date: "6.09",
      dayOfWeek: "월",
      status: "취소",
      content: "마트에서 장을 좀 보고 싶은데, 제가 몸이 불편해서 무거운 짐을 다 들수가 없어서 그런데, 도와주세요.",
      startTime: "오후 2:00",
      endTime: "오후 4:00"
    },
    {
      id: "4",
      date: "6.11",
      dayOfWeek: "수",
      status: "완료",
      content: "저희 할아버지와 동사무소에 같이 가주세요. 문서 작성도 조금 도와주시면 감사하겠습니다.",
      startTime: "오전 10:00",
      endTime: "오후 1:00"
    },
    {
      id: "5",
      date: "6.11",
      dayOfWeek: "수",
      status: "완료",
      content: "저희 할아버지와 동사무소에 같이 가주세요. 문서 작성도 조금 도와주시면 감사하겠습니다.",
      startTime: "오전 10:00",
      endTime: "오후 1:00"
    }
  ];

  const filteredRequests = activeTab === "전체" 
    ? helpRequests 
    : helpRequests.filter(request => request.status === activeTab);

  const getStatusColor = (status: HelpRequestStatus) => {
    switch (status) {
      case "예정":
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
    console.log("상세 보기:", id);
    // 상세 페이지로 이동하는 로직
  };

  const handleCancelReservation = (id: string) => {
    console.log("예약 취소:", id);
    // 예약 취소 로직
  };

  return (
    <div className={cn("helpListPage")}>
      {/* 헤더 */}
      <header className={cn("header")}>
        <div className={cn("headerContent")}>
          <h1 className={cn("logo")}>DS Helper</h1>
          <div className={cn("headerActions")}>
            <button className={cn("profileButton")}>
              <span className={cn("profileIcon")}>👤</span>
            </button>
            <button className={cn("menuButton")}>
              <span className={cn("menuIcon")}>☰</span>
            </button>
          </div>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <nav className={cn("tabNavigation")}>
        <div className={cn("tabContainer")}>
          {(["전체", "예정", "완료", "취소"] as const).map((tab) => (
            <button
              key={tab}
              className={cn("tabButton", { active: activeTab === tab })}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* 도움 요청 목록 */}
      <main className={cn("mainContent")}>
        <div className={cn("helpList")}>
          {filteredRequests.map((request) => (
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
                {request.status === "예정" && (
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
        </div>
      </main>
    </div>
  );
}
