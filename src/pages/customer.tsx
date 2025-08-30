// 고객 문의 페이지
import styles from '@/styles/Customer.module.scss';
import classNames from 'classnames/bind';
import { time } from 'console';
import React, { useState } from "react";

const cn = classNames.bind(styles);

export default function Customer(){
    const [activeTab, setActiveTab] = useState<"history" | "register">('history');
    const [inquiryType, setInquiryType] = useState("");
    const [content, setContent] = useState("");
    const [inquiries, setInquiries] = useState([
        {
            id: 1,
            status: "답변 보기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 ...",
            date:"2025.07.15",
            time:"17:38",
            answer:"안녕하세요. 불편을 드려 정말 죄송합니다. \n\n확인 결과, 해당 시간대에 배차 배경이 누락된 것으로 확인되었습니다. \n\n빠르게 연락을 드리지 못한 점 사과드리며, 다음 일정은 저희가 우선 배정해드릴 수 있도록 처리하겠습니다.\n\n다시 한 번 사과드리며, 곧 별도 연락드리겠습니다."
        },
        {
            id: 2,
            status: "답변 대기",
            content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 ...",
            date:"2025.08.21",
            time:"12:48",
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
    }
    const closeModal = () => {
        setSelectedAnswer(null);
        setModalOpen(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API 요청이나 처리 로직 추가하기
        console.log({ inquiryType, content });
    }
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
                            <p className={cn("emptyMessage")}>문의하신 내역이 없어요.</p>
                        </div>
                        ) : (
                            <ul className={cn("inquiryList")}>
                                {inquiries.map((item) => (
                                    <li key={item.id} className={cn("inquiryItem")}>
                                        <span className={cn("status", 
                                            {waiting: item.status==="답변 대기", 
                                            done: item.status==="답변 보기"})}
                                            onClick={() => openModal(item.answer)}
                                        >
                                            {item.status}
                                        </span>
                                        <p className={cn("content")}>{item.content} <a>...더보기</a></p>
                                        <p className={cn("date")}>{item.date}</p>
                                        
                            
                                    </li>
                                ))}
                            </ul>
                        ) 
                        
                    )}

                    {activeTab === "register" && (
                        <form className={cn("registerFrom")} onSubmit={handleSubmit}>
                            <div className={cn("formGroup")}>
                                <label>문의 유형</label>
                                <select 
                                    value={inquiryType}
                                    onChange={(e) => setInquiryType(e.target.value)}>
                                        <option value="help">도움 요청</option>
                                        <option value="uncomfortable">서비스 이용 불편</option>
                                        <option value="modify">서비스 개선 제안</option>
                                        <option value="etc">기타</option>
                                    </select>
                            </div>
                        </form>

                    )}
                </div>
            </div>


            {/* {isModalOpen && (
                <div className={cn("modalOverlay")} onClick={closeModal}>
                    <div className={cn("modalContent")} onClick={(e) => e.stopPropagation()}>
                        <h2>답변 내용</h2>
                        <button className={cn("closeBtn")} onClick={closeModal}>×</button>
                        <pre className={cn("answerText")}>{selectedAnswer}</pre>
                    </div>
            )} */}
        </div>
    );
}