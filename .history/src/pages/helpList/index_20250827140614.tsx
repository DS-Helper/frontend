import { useState } from "react";
import classNames from "classnames/bind";
import styles from "@/styles/HelpList.module.scss";
import { HelpRequestStatus } from "@/types/helpList"
import {  }

const cn = classNames.bind(styles);

export default function HelpListPage() {
  const [activeTab, setActiveTab] = useState<"전체" | "예정" | "완료" | "취소">("전체");

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
