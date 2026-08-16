import dynamic from "next/dynamic";
import classNames from "classnames/bind";
import styles from "@/styles/ToiletList.module.scss";

const cn = classNames.bind(styles);

const ToiletListMapView = dynamic(
  () => import("@/components/toilet/ToiletListMapView"),
  { ssr: false }
);

export default function ToiletListPage() {
  return (
    <main className={cn("pageRoot")} aria-label="화장실 목록">
      <p className={cn("desktopOnlyMessage")}>핸드폰에서 사용 가능한 기능이에요.</p>
      <div className={cn("mobileMain")}>
        <ToiletListMapView />
      </div>
    </main>
  );
}
