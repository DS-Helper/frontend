import styles from "@/styles/Home.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import home1 from "@/public/Hero-image.svg";

const cn = classNames.bind(styles);

export default function Home() {
  return (
    <div className={cn("home")}>
      <div className={cn("container")}>
        {/* 1페이지 */}
        <div className={cn("homePage1")}>
          <div className={cn("homePage1Content")}>
            <p className={cn("homePage1Title")}>
              달성군 이웃을 위한 <br /> 무료 방문 서비스
            </p>
            <Image src={home1} alt="home1" width={250} height={329} />
          </div>
          <button className={cn("homePage1Button")}>도움 요청하기</button>
        </div>
      </div>
    </div>
  );
}
