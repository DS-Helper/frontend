import styles from '@/styles/Customer.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from "react";

const cn = classNames.bind(styles);

export default function Customer(){
    const [activeTab, setActiveTab] = useState<"history" | "register">('history');
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
                    <form className={cn("registerFrom")}>
                        <div className={cn("formGroup")}>
                            <label>문의 유형</label>
                        </div>
                    </form>

                )}
            </div>
        </div>
    );
}