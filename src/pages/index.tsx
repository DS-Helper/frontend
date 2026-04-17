import styles from "../styles/Home.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPosts, parsePostsListBody } from "@/lib/apis/helpStory";
import { IoIosArrowForward } from "react-icons/io";
import { isAuthenticated } from "@/lib/utils/auth";

// ?��?지??
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
  const [storyList, setStoryList] = useState<Array<{
    postId: string;
    title: string;
    content: string;
    viewCount: number;
    date: string;
    img: string | typeof story;
  }>>([]);
  const [storyLoading, setStoryLoading] = useState(true);
  const router = useRouter();

  const handleHelp = async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      router.push("/help");
    } else {
      router.push("/login");
    }
  };
  const handleMoreStories = () => router.push("/helpStory");
  const handleStoryClick = (postId: string) => {
    router.push(`/helpStory/${postId}`);
  };

  // 버튼 목록
  const guideButtons = [
    "?�떤 ?��???주나??",
    "?��? ?�용?????�나??",
    "?�떻�??�청?�나??",
    "?�제 ?��?주나??",
  ];

  // ?�내 0�?
  const helpList = [
    { img: home1, title: "?�활 ?�봄 지??, desc: "?�보�? 병원 ?�행, 집안 ?�리, ?�사 ?�반 ?? },
    { img: home2, title: "?�서???�봄", desc: "말벗, ?�책 같이 가�??? },
    { img: home3, title: "?�이?�봄 지??, desc: "?�깐 ?�봄, 간단???�습, ?�하???�행 ?? },
    { img: home4, title: "�?��/?�인 ?�??지??, desc: "고립 �?�� 방문, 고�? ?�누�? ?�출 ?�행" },
    { img: home5, title: "기�?/?�체 ?�??지??, desc: "복�?관, 마을?��?, 보육???? },
  ];

  // ?�내 1�?
  const whoList = [
    "?�자 ?�시???�르??,
    "?��????�요??�?��",
    "?�이 케?��? ?�요??맞벌??부모님",
    "?�동?�나 ?�상?�활??불편??�?,
    "복�?기�? · 마을?�과 · ?�터 ??,
  ];

  // ?�내 2�?
  const howStartList = [
    { img: howStart1, title: "먼�? 로그???�주?�요!", desc: "?��????�청?�려�?로그?�이 ?�요?�요. 카카?? ?�이�? 구�? �??�한 방법???�택??주세?? SNS 로그?�이 ?�려?�신 분�? 로그???�단???�는 번호�??�락??주세??" },
    { img: howStart2, title: "?��????�청?�요", desc: "?�른�????�이�??? ???�른 ?? ?��? ?�청?�기 메뉴�??�택??주세??" },
    { img: howStart3, title: "?�보�??�력?�주?�요", desc: "?�청???�형???�택?�고, ?��???받을 분의 ?�보?� ?�시, 그리�??�청 ?�용???�력??주세??" },
    { img: howStart4, title: "?�청 ?�수 ?�료!", desc: "?�청???�형???�택?�고, ?��???받을 분의 ?�보?� ?�시, 그리�??�청 ?�용???�력??주세??" },
  ];

  // ?�내 3�?
  const whenList = [
    { img: calendar, title: "??�?방문", desc: "?�요?? 금요?�에�?방문??가?�해??" },
    { img: clock, title: "?�청 가???�간", desc: "?�전 10?��????�후 5?�까지 ?�청?????�어?? ?�청 ?�서???�라 ?�차?�으�??��??�려??" },
  ];

  // ?�짜 ?�맷???�수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // ?��?지 URL ?�효??검�?
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

  // ?�토�??�이??가?�오�?
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setStoryLoading(true);
        const response = await getPosts();
        
        if (response?.data) {
          const { posts: postsData } = parsePostsListBody(response.data);
          
          // 최신 �?개만 ?�페?��????�시 (최�? 4�?
          const latestPosts = postsData.slice(0, 4).map((post) => ({
            postId: post.postId,
            title: post.title,
            content: post.content,
            viewCount: post.viewCount,
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
        console.error('?��??�린 ?�야�?조회 ?�패:', error);
        setStoryList([]);
      } finally {
        setStoryLoading(false);
      }
    };

    fetchStories();
  }, []);

  // 버튼�??�더�?
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
      {/* 1?�이지 */}
      <div className={cn("homePage")}>
        <div className={cn("homePage1Hero")} />
        <p className={cn("homePage1Title")}>
          <span className={cn("homePage1TitleLine1", "homePage1TitleDesktop")}>
            ?�성�??�활밀착형 ?�랫??
            <br />
            ?�에?�헬??
          </span>
          <span className={cn("homePage1TitleLine1", "homePage1TitleCompact")}>
            ?�성�??�활밀착형
            <br />
            ?�랫??
            <br />
            ?�에?�헬??
          </span>
        </p>
      </div>

      {/* 2?�이지 */}
      <div className={cn("homePage2")}>
        <div className={cn("homePageWrapper")}>
          <p className={cn("title")}>?�용 ?�내</p>
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

      {/* 3?�이지 */}
      <div className={cn("homePage3")}>
        <div className={cn("homePageWrapper")}>
          <p className={cn("title")}>?��??�린 ?�야�?/p>
          {storyLoading ? (
            <div className={cn("storyLoading")}>
              <p>?��??�린 ?�야기�? 불러?�는 �?..</p>
            </div>
          ) : storyList.length > 0 ? (
            <>
              <ul className={cn("storyList")}>
                {storyList.map((s, i) => (
                  <li key={i} onClick={() => handleStoryClick(s.postId)}>
                    <div className={cn("storyTextBox")}>
                      <p className={cn("storyTitle")}>{s.title}</p>
                      <div className={cn("storyContent")}>
                        <span className={cn("storyDate")}>{s.date}</span>
                        <span className={cn("storyView")}>조회 {s.viewCount}</span>
                      </div>
                    </div>
                    <div className={cn("storyImage")}>
                      {typeof s.img === 'string' && isValidImageUrl(s.img) ? (
                        <Image
                          src={s.img}
                          alt="?��??�린 ?�야�?
                          width={240}
                          height={180}
                          className={cn("image")}
                        />
                      ) : (
                        <div className={cn("placeholderImage")}></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <button className={cn("moreStoriesButton")} onClick={handleMoreStories}>
                ?�보�?<IoIosArrowForward className={cn("moreStoriesArrow")} />
              </button>
            </>
          ) : (
            <div className={cn("storyEmpty")}>
              <p>?�직 ?��??�린 ?�야기�? ?�습?�다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
