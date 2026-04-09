import dynamic from "next/dynamic";
import classNames from "classnames/bind";
import styles from "@/styles/TrashBinList.module.scss";

const cn = classNames.bind(styles);

const TrashBinListMapView = dynamic(
  () => import("@/components/trashBin/TrashBinListMapView"),
  { ssr: false }
);

export default function TrashBinListPage() {
  return (
    <main className={cn("pageRoot")} aria-label="휴지통 목록">
      <p className={cn("desktopOnlyMessage")}>핸드폰에서 사용 가능한 기능이에요.</p>
      <div className={cn("mobileMain")}>
        <TrashBinListMapView />
      </div>
    </main>
  );
}
