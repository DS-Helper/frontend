import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';
import Image from 'next/image';
import banner from '@/public/help_request_banner.svg'
import {useState} from "react"
import { useRouter } from "next/router";

const cn = classNames.bind(styles);

export default function Help(){
  const router = useRouter();

  const checklist = [
    "방문시간은 주말 오전 10시 ~ 오후 5시 사이만 가능해요.",
    "최소 30분, 최대 3시간까지 예약 할 수 있어요.",
    "예약 완료 전에는 추가 예약이 불가해요.",
    "도움 요청 내용은 자세히 작성 해주시면 보다 정확하고 따뜻한 동행이 가능해요.",
  ];

  const [checkedItems, setCheckedItems] = useState(
    Array(checklist.length).fill(false)
  );

  const handleCheck = (index: any) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.every(Boolean);

  const handleNext = () => {
    if (allChecked) {
      alert("다음 단계로 이동합니다!"); 
      router.push('help/modify')
    } else {
      alert("모든 항목에 체크해야 진행할 수 있어요.");
    }
  };

  return (
    <div className={cn("help")}>
      <h1 className={cn("title")}>도움 요청하기</h1>
      <div className={cn("helpContent")}>
        <h2 className={cn("secondTitle")}>예약 전 꼭 읽어주세요!</h2>
        <ul className={cn("list")}>
          {checklist.map((text, i) => (
            <li key={i}>
              <input
                type="checkbox"
                checked={checkedItems[i]}
                onChange={() => handleCheck(i)}
              />
              <p>{text}</p>
            </li>
          ))}
        </ul>
        <button className={cn("nextButton")} onClick={handleNext}>확인</button>
        <div className={cn("bannerWrapper")}>
          <Image src={banner} alt="배너" fill className={cn("bannerImage")} />
        </div>
      </div>
    </div>
  );
}