import { useRouter } from "next/router";
import styles from "../../styles/Sidebar.module.scss";
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
      console.error('로그?�웃 �??�류:', error);
      // ?�러가 발생?�도 로그???�이지�??�동
      router.push('/');
    }
  };

  return (
    <div className={cn("sidebarBackground")} onClick={onClose}>
      <div className={cn("sidebar")}>
        <div className={cn("sidebarHeader")}>
          <div className={cn("sidebarHeaderClose")} onClick={onClose}>
            <FaAngleRight size={16} className={cn("sidebarHeaderCloseIcon")} />
          </div>
        </div>
        <ul className={cn("sidebarMenuList")}>
          <li><Link href="/help">?��? ?�청?�기</Link></li>
          <li><Link href="/helpList">?��? ?�청 ?�역</Link></li>
          <li onClick={handleCustomer} style={{cursor:"pointer"}}>고객 문의</li>
          <li><Link href="/helpStory">?��??�린 ?�야�?/Link></li>
          <li><Link href="/board">?�통�?/Link></li>
          {/* <li><Link href="/trash-bin-list">?�레기통 찾기</Link></li> */}
          <li onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>로그?�웃</li>
        </ul>
      </div>
    </div>
  );
}