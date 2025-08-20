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
    const [images, setImages] = useState<File[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API 요청이나 처리 로직 추가하기
        console.log({ inquiryType, content, images });
    }
    return (
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
                    <div className={cn("emptyBox")}>
                        <p className={cn("emptyMessage")}>문의하신 내역이 없어요.</p>
                    </div>
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
    );
}