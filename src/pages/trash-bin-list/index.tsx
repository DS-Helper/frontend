import dynamic from "next/dynamic";
import classNames from "classnames/bind";
import styles from "../../styles/TrashBinList.module.scss";

const cn = classNames.bind(styles);

const TrashBinListMapView = dynamic(
  () => import("@/components/trashBin/TrashBinListMapView"),
  { ssr: false }
);

export default function TrashBinListPage() {
  return (
    <main className={cn("pageRoot")} aria-label="?��???목록">
      <p className={cn("desktopOnlyMessage")}>?�드?�에???�용 가?�한 기능?�에??</p>
      <div className={cn("mobileMain")}>
        <TrashBinListMapView />
      </div>
    </main>
  );
}
