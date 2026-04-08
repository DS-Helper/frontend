import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/Account.module.scss";

type AccountTab = "profile" | "myPosts" | "scrap";

interface AccountSideBarProps {
  activeTab: AccountTab;
  onLogout: () => void;
}

const cn = classNames.bind(styles);

export default function AccountSideBar({ activeTab, onLogout }: AccountSideBarProps) {
  const router = useRouter();

  const goProfile = () => {
    if (activeTab === "profile") return;
    router.push("/account");
  };

  const goScrap = () => {
    if (activeTab === "scrap") return;
    router.push("/account/scrap");
  };

  const goMyPosts = () => {
    if (activeTab === "myPosts") return;
    router.push("/account/posts");
  };

  return (
    <aside className={cn("sidebar")}>
      <ul className={cn("navList")}>
        <li
          className={cn("navItem", { navItemActive: activeTab === "profile" })}
          onClick={goProfile}
          onKeyDown={(e) => e.key === "Enter" && goProfile()}
          role="button"
          tabIndex={0}
        >
          프로필
        </li>
        <li
          className={cn("navItem", { navItemActive: activeTab === "myPosts" })}
          onClick={goMyPosts}
          onKeyDown={(e) => e.key === "Enter" && goMyPosts()}
          role="button"
          tabIndex={0}
        >
          내 게시물
        </li>
        <li
          className={cn("navItem", { navItemActive: activeTab === "scrap" })}
          onClick={goScrap}
          onKeyDown={(e) => e.key === "Enter" && goScrap()}
          role="button"
          tabIndex={0}
        >
          스크랩
        </li>
        <li
          className={cn("navItem")}
          onClick={onLogout}
          onKeyDown={(e) => e.key === "Enter" && onLogout()}
          role="button"
          tabIndex={0}
        >
          로그아웃
        </li>
      </ul>
    </aside>
  );
}
