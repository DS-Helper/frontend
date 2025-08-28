import styles from "@/styles/Sidebar.module.scss";
import classNames from "classnames/bind";
import { FaAngleRight } from "react-icons/fa6";
import Link from "react"

const cn = classNames.bind(styles);

export default function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className={cn("sidebarBackground")} onClick={onClose}>
      <div className={cn("sidebar")}>
        <div className={cn("sidebarHeader")}>
          <div className={cn("sidebarHeaderClose")} onClick={onClose}>
            <FaAngleRight size={16} />
          </div>
        </div>
        <div className={cn("sidebarMenuList")}>
          <Link>도움 요청하기</Link>
          <li>도움 요청 내역</li>
          <li>채팅 상담</li>
          <li>로그아웃</li>
        </div>
      </div>
    </div>
  );
}
