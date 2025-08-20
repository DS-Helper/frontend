import styles from "@/styles/Home.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";

// 이미지들
import mainImage from "@/public/Hero-image.svg";
import home1 from "@/public/home1.svg";
import home2 from "@/public/home2.svg";
import home3 from "@/public/home3.svg";
import home4 from "@/public/home4.svg";
import home5 from "@/public/home5.svg";
import howStart1 from "@/public/howStart1.svg";
import howStart2 from "@/public/howStart2.svg";
import howStart3 from "@/public/howStart3.svg";
import howStart4 from "@/public/howStart4.svg";
import clock from "@/public/clock.svg";
import calendar from "@/public/calendar.svg";
import story from "@/public/story.svg";

const cn = classNames.bind(styles);

export default function Home() {
  const [activeButton, setActiveButton] = useState(0);
  const router = useRouter();

  const handleHelp = () => router.push("/help");

  // 버튼 목록
  const guideButtons = [
    "어떤 도움을 주나요?",
    "누가 이용할 수 있나요?",
    "어떻게 신청하나요?",
    "언제 도와주나요?",
  ];

  // 안내 0번
  const helpList = [
    { img: home1, title: "생활 돌봄 지원", desc: "장보기, 병원 동행, 집안 정리, 식사 동반 등" },
    { img: home2, title: "정서적 돌봄", desc: "말벗, 산책 같이 가기 등" },
    { img: home3, title: "아이돌봄 지원", desc: "잠깐 돌봄, 간단한 학습, 등하원 동행 등" },
    { img: home4, title: "청년/성인 대상 지원", desc: "고립 청년 방문, 고민 나누기, 외출 동행" },
    { img: home5, title: "기관/단체 대상 지원", desc: "복지관, 마을회관, 보육원 등" },
  ];

  // 안내 1번
  const whoList = [
    "혼자 사시는 어르신",
    "도움이 필요한 청년",
    "아이 케어가 필요한 맞벌이 부모님",
    "이동이나 일상생활이 불편한 분",
    "복지기관 · 마을회과 · 센터 등",
  ];

  // 안내 2번
  const howStartList = [
    { img: howStart1, title: "먼저 로그인 해주세요!", desc: "카카오, 네이버, 구글 로그인 필요..." },
    { img: howStart2, title: "도움을 신청해요", desc: "≡ 메뉴에서 도움 요청하기 선택" },
    { img: howStart3, title: "정보를 입력해주세요", desc: "신청자 유형, 정보, 일시, 요청 내용 입력" },
    { img: howStart4, title: "요청 접수 완료!", desc: "헬퍼가 확인 후 확정 알림 예정" },
  ];

  // 안내 3번
  const whenList = [
    { img: calendar, title: "주말 방문", desc: "현재는 토요일과 일요일만 가능" },
    { img: clock, title: "요청 가능 시간", desc: "오전 10시 ~ 오후 5시" },
  ];

  // 스토리
  const storyList = [
    {
      title: "수술 후 거동이 어려운 이웃과 함께 병원에 방문",
      content: "무릎 수술 후 한 달 간 외출이 힘들었던 분과 동행하여 병원과 약국에 방문했어요.",
      date: "2025.06.10",
      img: story,
    },
    {
      title: "수술 후 거동이 어려운 이웃과 함께 병원에 방문",
      content: "무릎 수술 후 한 달 간 외출이 힘들었던 분과 동행하여 병원과 약국에 방문했어요.",
      date: "2025.06.10",
      img: story,
    },
  ];

  // 버튼별 렌더링
  const renderContent = () => {
    switch (activeButton) {
      case 0:
        return (
          <ul className={cn("homePageList")}>
            {helpList.map((item, i) => (
              <li key={i}>
                <Image src={item.img} alt={item.title} width={180} height={180} />
                <p>{item.title}</p>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        );
      case 1:
        return (
          <ul className={cn("homePageList2")}>
            {whoList.map((text, i) => <li key={i}>{text}</li>)}
          </ul>
        );
      case 2:
        return (
          <ul className={cn("homePageList3")}>
            {howStartList.map((item, i) => (
              <li key={i}>
                <Image src={item.img} alt={item.title} width={308} height={530} />
                <div>
                  <p>{item.title}</p>
                  <span>{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        );
      case 3:
        return (
          <ul className={cn("homePageList4")}>
            {whenList.map((item, i) => (
              <li key={i}>
                <Image src={item.img} alt={item.title} width={204} height={170} />
                <div>
                  <p>{item.title}</p>
                  <span>{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("home")}>
      <div className={cn("container")}>
        {/* 1페이지 */}
        <div className={cn("homePage")}>
          <div className={cn("homePage1Content")}>
            <p className={cn("homePage1Title")}>
              달성군 이웃을 위한 <br /> 무료 방문 서비스
            </p>
            <Image src={mainImage} alt="메인 이미지" width={250} height={329} />
          </div>
          <button className={cn("homePage1Button")} onClick={handleHelp}>
            도움 요청하기
          </button>
        </div>

        {/* 2페이지 */}
        <div className={cn("homePage2")}>
          <div className={cn("homePageWrapper")}>
            <p className={cn("title")}>이용 안내</p>
            <div className={cn("homePageContent")}>
              <div className={cn("homePageButton")}>
                {guideButtons.map((text, i) => (
                  <button
                    key={i}
                    className={cn("homePageButtonItem", { active: activeButton === i })}
                    onClick={() => setActiveButton(i)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              {renderContent()}
            </div>
          </div>
        </div>

        {/* 3페이지 */}
        <div className={cn("homePage3")}>
          <div className={cn("homePageWrapper")}>
            <p className={cn("title")}>도와드린 이야기</p>
            <ul className={cn("storyList")}>
              {storyList.map((s, i) => (
                <li key={i}>
                  <div>
                    <p className={cn("storyTitle")}>{s.title}</p>
                    <span className={cn("storyContent")}>{s.content}</span>
                    <span className={cn("storyDate")}>{s.date}</span>
                  </div>
                  <Image src={s.img} alt="도와드린 이야기" width={240} height={180} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
