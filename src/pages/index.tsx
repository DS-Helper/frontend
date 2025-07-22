import styles from "@/styles/Home.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
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

import { useState } from "react";

const cn = classNames.bind(styles);

export default function Home() {
  const [activeButton, setActiveButton] = useState(0);

  return (
    <div className={cn("home")}>
      <div className={cn("container")}>
        {/* 1페이지 */}
        <div className={cn("homePage")}>
          <div className={cn("homePage1Content")}>
            <p className={cn("homePage1Title")}>
              달성군 이웃을 위한 <br /> 무료 방문 서비스
            </p>
            <Image
              src={mainImage}
              alt="달성군 이웃을 위한 무료 방문 서비스"
              width={250}
              height={329}
            />
          </div>
          <button className={cn("homePage1Button")}>도움 요청하기</button>
        </div>

        {/* 2페이지 */}
        <div className={cn("homePage2")}>
          <div className={cn("homePageWrapper")}>
            <p className={cn("title")}>이용 안내</p>
            <div className={cn("homePageContent")}>
              <div className={cn("homePageButton")}>
                <button
                  className={cn("homePageButtonItem", {
                    active: activeButton === 0,
                  })}
                  onClick={() => setActiveButton(0)}
                >
                  어떤 도움을 주나요?
                </button>
                <button
                  className={cn("homePageButtonItem", {
                    active: activeButton === 1,
                  })}
                  onClick={() => setActiveButton(1)}
                >
                  누가 이용할 수 있나요?
                </button>
                <button
                  className={cn("homePageButtonItem", {
                    active: activeButton === 2,
                  })}
                  onClick={() => setActiveButton(2)}
                >
                  어떻게 신청하나요?
                </button>
                <button
                  className={cn("homePageButtonItem", {
                    active: activeButton === 3,
                  })}
                  onClick={() => setActiveButton(3)}
                >
                  언제 도와주나요?
                </button>
              </div>

              {activeButton === 0 && (
                <ul className={cn("homePageList")}>
                  <li>
                    <Image
                      src={home1}
                      alt="생활 돌봄 지원"
                      width={180}
                      height={180}
                    />
                    <p>생활 돌봄 지원</p>
                    <span>장보기, 병원 동행, 집안 정리, 식사 동반 등</span>
                  </li>
                  <li>
                    <Image
                      src={home2}
                      alt="정서적 돌봄"
                      width={180}
                      height={180}
                    />
                    <p>정서적 돌봄</p>
                    <span>말벗, 산책 같이 가기 등</span>
                  </li>
                  <li>
                    <Image
                      src={home3}
                      alt="아이돌봄 지원"
                      width={180}
                      height={180}
                    />
                    <p>아이돌봄 지원</p>
                    <span>잠깐 돌봄, 간단한 학습, 등하원 동행 등</span>
                  </li>
                  <li>
                    <Image
                      src={home4}
                      alt="청년/성인 대상 지원"
                      width={180}
                      height={180}
                    />
                    <p>청년/성인 대상 지원</p>
                    <span>고립 청년 방문, 고민 나누기, 외출 동행</span>
                  </li>
                  <li>
                    <Image
                      src={home5}
                      alt="기관/단체 대상 지원"
                      width={180}
                      height={180}
                    />
                    <p>기관/단체 대상 지원</p>
                    <span>복지관, 마을회관, 보육원 등</span>
                  </li>
                </ul>
              )}

              {activeButton === 1 && (
                <ul className={cn("homePageList2")}>
                  <li>혼자 사시는 어르신</li>
                  <li>도움이 필요한 청년</li>
                  <li>아이 케어가 필요한 맞벌이 부모님</li>
                  <li>이동이나 일상생활이 불편한 분</li>
                  <li>복지기관 · 마을회과 · 센터 등</li>
                </ul>
              )}

              {activeButton === 2 && (
                <ul className={cn("homePageList3")}>
                  <li>
                    <Image
                      src={howStart1}
                      alt="먼저 로그인 해주세요!"
                      width={308}
                      height={530}
                    />
                    <div>
                      <p>먼저 로그인 해주세요!</p>
                      <span>
                        도움을 요청하려면 로그인이 필요해요. 카카오, 네이버,
                        구글 중 편한 방법을 선택해 주세요. SNS 로그인이 어려우신
                        분은 로그인 하단에 있는 번호로 연락해 주세요.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>도움을 신청해요</p>
                      <span>
                        오른쪽 위 아이콘(≡) 을 누른 뒤, 도움 요청하기 메뉴를
                        선택해 주세요.
                      </span>
                    </div>
                    <Image
                      src={howStart2}
                      alt="도움을 신청해요"
                      width={308}
                      height={530}
                    />
                  </li>
                  <li>
                    <Image
                      src={howStart3}
                      alt="정보를 입력해주세요"
                      width={308}
                      height={530}
                    />
                    <div>
                      <p>정보를 입력해주세요</p>
                      <span>
                        신청자 유형을 선택하고, 도움을 받을 분의 정보와 일시,
                        그리고 요청 내용을 입력해 주세요.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>요청 접수 완료!</p>
                      <span>
                        도움 요청이 정상적으로 접수되었어요. 헬퍼가 내용을
                        확인한 뒤 확정 알림을 보내드릴 예정이에요.
                      </span>
                    </div>
                    <Image
                      src={howStart4}
                      alt="요청 접수 완료!"
                      width={308}
                      height={530}
                    />
                  </li>
                </ul>
              )}

              {activeButton === 3 && (
                <ul className={cn("homePageList4")}>
                  <li>
                    <Image
                      src={calendar}
                      alt="주말 방문"
                      width={204}
                      height={170}
                    />
                    <div>
                      <p>주말 방문</p>
                      <span>
                        현재는 토요일과 일요일에만 방문해요. 평일 서비스는 추후
                        제공될 예정이에요.
                      </span>
                    </div>
                  </li>
                  <li>
                    <Image
                      src={clock}
                      alt="요청 가능 시간은 오전 10시부터 오후 5시까지"
                      width={204}
                      height={204}
                    />
                    <div>
                      <p>요청 가능 시간</p>
                      <span>
                        오전 10시부터 오후 5시까지 요청할 수 있어요. 요청 순서에
                        따라 순차적으로 도와드려요.
                      </span>
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 3페이지 */}
        <div className={cn("homePage3")}>
          <div className={cn("homePageWrapper")}>
            <p className={cn("title")}>도와드린 이야기</p>
            <ul className={cn("storyList")}>
              <li>
                <div>
                  <p className={cn("storyTitle")}>
                    수술 후 거동이 어려운 이웃과 함께 병원에 방문
                  </p>
                  <span className={cn("storyContent")}>
                    무릎 수술 후 한 달 간 외출이 힘들었던 분과 동행하여 병원과
                    약국에 방문했어요.
                  </span>
                  <span className={cn("storyDate")}>2025.06.10</span>
                </div>
                <Image
                  src={story}
                  alt="도와드린 이야기 사진"
                  width={240}
                  height={180}
                />
              </li>
              <li>
                <div>
                  <p className={cn("storyTitle")}>
                    수술 후 거동이 어려운 이웃과 함께 병원에 방문
                  </p>
                  <span className={cn("storyContent")}>
                    무릎 수술 후 한 달 간 외출이 힘들었던 분과 동행하여 병원과
                    약국에 방문했어요.
                  </span>
                  <span className={cn("storyDate")}>2025.06.10</span>
                </div>
                <Image
                  src={story}
                  alt="도와드린 이야기 사진"
                  width={240}
                  height={180}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
