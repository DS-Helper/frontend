// Help page's Sidebar component
import React from 'react';
import Image from 'next/image';
import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';
import { useRouter } from "next/router";

import logo from '@/public/logo.svg';

const cn = classNames.bind(styles);

export default function HelpSidebar(){
    const router = useRouter();

    return (
        <div className={cn("sidebar")}>
            <div className={cn("sidebarLogo")} onClick={()=> router.push('/')}>
                <Image src={logo} alt='logo' width={200} height={50} />
            </div>

            <ul className={cn("sidebarMenuList")}>
              <li>대시보드</li>
              <li>도움 요청</li>
              <li>고객 문의</li>
              <li>알림</li>
              <li>활동 게시물</li>
            </ul>
        </div>
      );
}