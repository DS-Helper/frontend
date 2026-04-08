import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "@/styles/Account.module.scss";
import AccountSideBar from "@/components/AccountSideBar";
import { handleLogout } from "@/lib/utils/logout";

const cn = classNames.bind(styles);

export default function MyPostsPage() {
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      router.push("/");
    }
  };

  return (
    <div className={cn("wrapper")}>
      <AccountSideBar activeTab="myPosts" onLogout={handleLogoutClick} />

      <main className={cn("main")}>
        <section className={cn("profileSection")}>
          <div className={cn("userInfo")}>
            <p className={cn("userEmail")}>작성한 게시글이 없습니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
