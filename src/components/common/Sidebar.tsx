import { useRouter } from "next/router";
import styles from "@/styles/Sidebar.module.scss";
import classNames from "classnames/bind";
import { FaAngleRight } from "react-icons/fa6";
import Link from "next/link";
import { handleLogout } from "@/lib/utils/logout";

const cn = classNames.bind(styles);

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  
  const handleCustomer = () => {
    router.push("/customer");
  }
  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 에러가 발생해도 로그인 페이지로 이동
      router.push('/');
    }
  };

  return (
    <div className={cn("sidebarBackground")} onClick={onClose}>
      <div className={cn("sidebar")}>
        <div className={cn("sidebarHeader")}>
          <div className={cn("sidebarHeaderClose")} onClick={onClose}>
            <FaAngleRight size={16} />
          </div>
        </div>
        <ul className={cn("sidebarMenuList")}>
          <li><Link href="/help">도움 요청하기</Link></li>
          <li><Link href="/helpList">도움 요청 내역</Link></li>
          <li onClick={handleCustomer} style={{cursor:"pointer"}}>고객 문의</li>
          <li><Link href="/helpStory">도와드린 이야기</Link></li>
          <li onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>로그아웃</li>
        </ul>
      </div>
    </div>
  );
}