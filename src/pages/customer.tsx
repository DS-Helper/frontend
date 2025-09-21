// 고객 문의 페이지
import styles from '@/styles/Customer.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from "react";

const cn = classNames.bind(styles);

export default function Customer(){
    const [activeTab, setActiveTab] = useState<"history" | "register">('history');
    const [inquiryType, setInquiryType] = useState(""); //문의 타입
    const [content, setContent] = useState("");
    
    //임의 문의 데이터
    const [inquiries, setInquiries] = useState([
        {
            id: 1,
            status: "답변 보기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.07.15",
            time:"17:38",
            image:"/public/hospital.jpg" ,
            answer:"안녕하세요. 불편을 드려 정말 죄송합니다. \n\n확인 결과, 해당 시간대에 배차 배경이 누락된 것으로 확인되었습니다. \n\n빠르게 연락을 드리지 못한 점 사과드리며, 다음 일정은 저희가 우선 배정해드릴 수 있도록 처리하겠습니다.\n\n다시 한 번 사과드리며, 곧 별도 연락드리겠습니다."
        },
        {
            id: 2,
            status: "답변 대기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.08.21",
            time:"12:48",
            image: undefined,
            answer: null
        },
        {
            id: 3,
            status: "답변 보기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.07.15",
            time:"17:38",
            image: undefined,
            answer:"안녕하세요. 불편을 드려 정말 죄송합니다. \n\n확인 결과, 해당 시간대에 배차 배경이 누락된 것으로 확인되었습니다. \n\n빠르게 연락을 드리지 못한 점 사과드리며, 다음 일정은 저희가 우선 배정해드릴 수 있도록 처리하겠습니다.\n\n다시 한 번 사과드리며, 곧 별도 연락드리겠습니다."
        },
        {
            id: 4,
            status: "답변 대기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.08.21",
            time:"12:48",
            image: undefined,
            answer: null
        },
        {
            id: 5,
            status: "답변 보기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.07.15",
            time:"17:38",
            image: undefined,
            answer:"안녕하세요. 불편을 드려 정말 죄송합니다. \n\n확인 결과, 해당 시간대에 배차 배경이 누락된 것으로 확인되었습니다. \n\n빠르게 연락을 드리지 못한 점 사과드리며, 다음 일정은 저희가 우선 배정해드릴 수 있도록 처리하겠습니다.\n\n다시 한 번 사과드리며, 곧 별도 연락드리겠습니다."
        },
        {
            id: 6,
            status: "답변 대기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.08.21",
            time:"12:48",
            image: undefined,
            answer: null
        },
        {
            id: 7,
            status: "답변 대기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 동행 요청을 드렸는데, 갑자기 병원이 날짜를 변경해서 다음주 금요일로 바뀌었습니다. 현재 요청한 일자를 바꾸고 싶은데 취소 후 재신청 외에는 방법이 없을까요 ? 이전 내용이 사라질까봐 걱정돼서 문의 드립니다.",
            date:"2025.08.21",
            time:"12:48",
            image: undefined,
            answer: null
        }
    ]);

    // 답변 내용 모달
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
    const openModal = (answer: string | null) => {
        if (!answer) return; // 답변 없는 경우 클릭 x
        setSelectedAnswer(answer);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedAnswer(null);
        setModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API 요청이나 처리 로직 추가하기
        console.log({ inquiryType, content });
    };

    /*
     <더보기>
     expandedItems는 확장된 상태의 아이템 ID들을 저장하는 배열로 확장 여부 추적
     기본은 43자까지만 표시 -> 클릭 시 전체 내용 -> 재클릭시 접힘
    */
    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    // 항목 확장/축소 토글 기능 구현
    const itemToggle = (id: number) =>{
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((x)=>x!==id) : [...prev, id]
        );
    };
    
    /*페이지네이션 처리*/
    const indexOfLast = currentPage * itemsPerPage; // 현재 페이지에서 끝에 해당하는 배열 인덱스
    const indexOfFirst = indexOfLast - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
    const currentInquiries = inquiries.slice(indexOfFirst, indexOfLast); // 실제 현재 페이지에 보여줄 항목들의 배열
    
    const totalPages = Math.ceil(inquiries.length / itemsPerPage); // 전체 페이지 수(마지막 페이지 번호)
    
    return (
        <div className={cn("background")}>
            <div className={cn("customer")}>
                <h1 className={cn("title")}>고객 문의</h1>

                <div className={cn("tabMenu")}>
                    <button
                        className={cn("tab", {active: activeTab === "history"})}
                        onClick={() => setActiveTab("history")}
                    >
                        문의 내역
                    </button>
                    <button
                        className={cn("tab", {active: activeTab === "register"})}
                        onClick={() => setActiveTab("register")}
                    >
                        문의 등록
                    </button>
                </div>
                
                <div className={cn("tabContent")}>
                    {activeTab === "history" && (
                        inquiries.length === 0 ? (
                            <div className={cn("emptyBox")}>
                            <p className={cn("emptyMessage")}>문의하신 내역이 없어요.</p> </div>
                        ) 
                        :(
                        <>
                            <ul className={cn("inquiryList")}>
                                {currentInquiries.map((item) => {
                                    const isExpanded = expandedItems.includes(item.id);
                                    const isLong = item.content.length > 41; // 글자 수 42가 최대
                                    const displayContent = isExpanded || !isLong 
                                    ? item.content 
                                    : item.content.slice(0,41) +"...";
                                return(
                                    <li key={item.id} className={cn("inquiryItem")}>
                                        <span className={cn("status", 
                                            {waiting: item.status==="답변 대기", 
                                            done: item.status==="답변 보기"})}
                                            onClick={() => openModal(item.answer)}
                                        > 
                                            {item.status}
                                        </span>
                                        <p className={cn("content")}>
                                            {displayContent}
                                            {isLong && (
                                                <a onClick={() => itemToggle(item.id)}
                                                > {isExpanded ? " 접기":" 더보기"}
                                                </a>
                                            )}
                                        </p>

                                        {/* 이미지 표시*/}
                                        {item.image && (
                                            <div className={cn("imageWrapper")}>
                                                <img 
                                                src={item.image}
                                                alt="문의 이미지"
                                                className={cn("inquiryImage")}/>
                                            </div>

                                        )}

                                        <div className={cn("dateTime")}>
                                            <span className={cn("date")}>{item.date}</span>
                                            <span className={cn("time")}>{item.time}</span>
                                        </div>
                                    </li>
                                );
                            })}
                            </ul>
                            {/*Pagenation*/}
                            {totalPages > 1 && (
                                <div className={cn("pagination")}>
                                    <button 
                                    disabled={currentPage===1}
                                    onClick={() => setCurrentPage((p) => p-1)}
                                    > {"<"} 
                                    </button>
                                    {Array.from({length: totalPages }, (_,i) => (
                                        <button
                                            key={i+1}
                                            className={cn({activate: currentPage === i+1})}
                                            onClick={() => setCurrentPage(i+1)}
                                        >
                                            {i+1}
                                        </button>
                                    ))}
                                    <button 
                                        disabled={currentPage===totalPages}
                                        onClick={() => setCurrentPage((p) => p+1)}
                                    >
                                        {">"} 
                                    </button>
                                </div>
                            )}
                        </>
                        )  
                    )}

                    {activeTab === "register" && (
                        <form className={cn("registerForm")} onSubmit={handleSubmit}>
                            <div className={cn("formGroup")}>
                                <label>문의 유형</label>
                                <div className={cn("customSelectWrapper")}>
                                <select 
                                    className={cn("customSelect")}
                                    value={inquiryType}
                                    onChange={(e) => setInquiryType(e.target.value)}>
                                        <option value="" disabled>문의 유형을 선택하세요</option>
                                        <option value="help">도움 요청</option>
                                        <option value="uncomfortable">서비스 이용 불편</option>
                                        <option value="proposal">서비스 개선 제안</option>
                                        <option value="etc">기타</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* 답변 내용 모달 */}
            {isModalOpen && (
                <div className={cn("modalOverlay")} onClick={closeModal}>
                    <div className={cn("modalContent")} onClick={(e) => e.stopPropagation()}>
                        <h2>답변 내용</h2>
                        <button className={cn("closeBtn")} onClick={closeModal}>x</button>
                        <pre className={cn("answerText")}>{selectedAnswer}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}