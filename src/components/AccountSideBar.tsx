import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "../styles/Account.module.scss";

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

  const goDeleteAccount = () => {
    router.push("/account/delete");
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
          ?�로??
        </li>
        <li
          className={cn("navItem", { navItemActive: activeTab === "myPosts" })}
          onClick={goMyPosts}
          onKeyDown={(e) => e.key === "Enter" && goMyPosts()}
          role="button"
          tabIndex={0}
        >
          ??게시�?
        </li>
        <li
          className={cn("navItem", { navItemActive: activeTab === "scrap" })}
          onClick={goScrap}
          onKeyDown={(e) => e.key === "Enter" && goScrap()}
          role="button"
          tabIndex={0}
        >
          ?�크??
        </li>
        <li
          className={cn("navItem")}
          onClick={onLogout}
          onKeyDown={(e) => e.key === "Enter" && onLogout()}
          role="button"
          tabIndex={0}
        >
          로그?�웃
        </li>
        <li
          className={cn("navItem")}
          onClick={goDeleteAccount}
          onKeyDown={(e) => e.key === "Enter" && goDeleteAccount()}
          role="button"
          tabIndex={0}
        >
          계정 ??��
        </li>
      </ul>
    </aside>
  );
}
