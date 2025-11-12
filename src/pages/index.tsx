import styles from "@/styles/Home.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPosts } from "@/lib/apis/helpStory";
import { IoIosArrowForward } from "react-icons/io";

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

interface StoryPost {
  postId: string;
  title: string;
  content: string;
  writerName: string;
  imageUrls: string[];
  createdAt: string;
}

export default function Home() {
  const [activeButton, setActiveButton] = useState(0);
  const [storyList, setStoryList] = useState<Array<{
    postId: string;
    title: string;
    content: string;
    date: string;
    img: string | typeof story;
  }>>([]);
  const [storyLoading, setStoryLoading] = useState(true);
  const router = useRouter();

  const handleHelp = () => router.push("/help");
  const handleMoreStories = () => router.push("/helpStory");
  const handleStoryClick = (postId: string) => {
    router.push(`/helpStory/${postId}`);
  };

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
    { img: howStart1, title: "먼저 로그인 해주세요!", desc: "도움을 요청하려면 로그인이 필요해요. 카카오, 네이버, 구글 중 편한 방법을 선택해 주세요. SNS 로그인이 어려우신 분은 로그인 하단에 있는 번호로 연락해 주세요." },
    { img: howStart2, title: "도움을 신청해요", desc: "오른쪽 위 아이콘(≡) 을 누른 뒤, 도움 요청하기 메뉴를 선택해 주세요." },
    { img: howStart3, title: "정보를 입력해주세요", desc: "신청자 유형을 선택하고, 도움을 받을 분의 정보와 일시, 그리고 요청 내용을 입력해 주세요." },
    { img: howStart4, title: "요청 접수 완료!", desc: "신청자 유형을 선택하고, 도움을 받을 분의 정보와 일시, 그리고 요청 내용을 입력해 주세요." },
  ];

  // 안내 3번
  const whenList = [
    { img: calendar, title: "수/금 방문", desc: "수요일, 금요일에만 방문이 가능해요." },
    { img: clock, title: "요청 가능 시간", desc: "오전 10시부터 오후 5시까지 요청할 수 있어요. 요청 순서에 따라 순차적으로 도와드려요." },
  ];

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // 이미지 URL 유효성 검증
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url.includes('null')) return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
      return false;
    }
  };

  // 스토리 데이터 가져오기
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setStoryLoading(true);
        const response = await getPosts();
        
        if (response && response.data) {
          const postsData: StoryPost[] = response.data.posts || [];
          
          // 최신 몇 개만 홈페이지에 표시 (최대 4개)
          const latestPosts = postsData.slice(0, 4).map((post) => ({
            postId: post.postId,
            title: post.title,
            content: post.content,
            date: formatDate(post.createdAt),
            img: post.imageUrls && post.imageUrls.length > 0 && isValidImageUrl(post.imageUrls[0])
              ? post.imageUrls[0]
              : story,
          }));
          
          setStoryList(latestPosts);
        } else {
          setStoryList([]);
        }
      } catch (error) {
        console.error('도와드린 이야기 조회 실패:', error);
        setStoryList([]);
      } finally {
        setStoryLoading(false);
      }
    };

    fetchStories();
  }, []);

  // 버튼별 렌더링
  const renderContent = () => {
    switch (activeButton) {
      case 0:
        return (
          <div className={cn("homePageListWrapper")}>
            <ul className={cn("homePageList")}>
              {helpList.map((item, i) => (
                <li key={i}>
                  <Image src={item.img} className={cn("homePageListImage")} alt={item.title} width={180} height={180} />
                  <p>{item.title}</p>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 1:
        return (
          <div className={cn("homePageListWrapper")}>
            <ul className={cn("homePageList2")}>
              {whoList.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>
        );
      case 2:
        return (
          <div className={cn("homePageListWrapper")}>
            <ul className={cn("homePageList3")}>
            {howStartList.map((item, i) => (
              <li key={i}>
                <Image src={item.img} alt={item.title} width={308} height={530} className={cn("homePageList3Image")} />
                <div>
                  <p>{item.title}</p>
                  <span>{item.desc}</span>
                </div>
              </li>
            ))}
            </ul>
          </div>
        );
      case 3:
        return (
          <div className={cn("homePageListWrapper")}>
            <ul className={cn("homePageList4")}>
            {whenList.map((item, i) => (
              <li key={i}>
                <Image src={item.img} alt={item.title} width={204} height={170} className={cn("homePageList4Image")} />
                <div>
                  <p>{item.title}</p>
                  <span>{item.desc}</span>
                </div>
              </li>
            ))}
            </ul>
          </div>
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
            <Image src={mainImage} className={cn("homePage1Image")} alt="메인 이미지" width={250} height={329} />
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
            {storyLoading ? (
              <div className={cn("storyLoading")}>
                <p>도와드린 이야기를 불러오는 중...</p>
              </div>
            ) : storyList.length > 0 ? (
              <>
                <ul className={cn("storyList")}>
                  {storyList.map((s, i) => (
                    <li key={i} onClick={() => handleStoryClick(s.postId)}>
                      <div>
                        <p className={cn("storyTitle")}>{s.title}</p>
                        <span className={cn("storyContent")}>{s.content}</span>
                        <span className={cn("storyDate")}>{s.date}</span>
                      </div>
                      <Image src={s.img} className={cn("storyImage")} alt="도와드린 이야기" width={240} height={180} />
                    </li>
                  ))}
                </ul>
                <button className={cn("moreStoriesButton")} onClick={handleMoreStories}>
                  더보기 <IoIosArrowForward className={cn("moreStoriesArrow")} />
                </button>
                
              </>
            ) : (
              <div className={cn("storyEmpty")}>
                <p>아직 도와드린 이야기가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
