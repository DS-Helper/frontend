import styles from "@/styles/Help.module.scss"; // Help에서 사용될 CSS정의해놓은 경로에서 가져오기
import classNames from 'classnames/bind';
import HelpSidebar from "@/components/HelpSidebar";
import React from "react";

const cn = classNames.bind(styles);

export default function Help(){
    return (
        <div>
            <main style={{flex:1, padding: '24px'}}>
            </main>
        </div>
    );
} 

Help.getLayout = function getLayout(page: React.ReactNode){
    return page;
}