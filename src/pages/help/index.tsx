import styles from "../../styles/Help.module.scss";
import classNames from 'classnames/bind';
import Image from 'next/image';
import banner from '@/public/help_request_banner.svg'
import {useState} from "react"
import { useRouter } from "next/navigation";

const cn = classNames.bind(styles);

export default function Help(){
  const router = useRouter();

  const checklist = [
    "방문?�간?� ?�요???�전 10??~ ?�후 5???�이�?가?�해??",
    "최소 30�? 최�? 3?�간까�? ?�약 ?????�어??",
    "?�약 ?�료 ?�에??추�? ?�약??불�??�요.",
    "?��? ?�동 �?촬영???�진?� SNS?� ?�도?�?�린 ?�야기�??�이지??공유?????�습?�다.",
  ];

  const [checkedItems, setCheckedItems] = useState(
    Array(checklist.length).fill(false)
  );

  const handleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.every(Boolean);

  const handleNext = () => {
    if (allChecked) {
      router.push('help/modify')
    } else {
      alert("모든 ??��??체크?�야 진행?????�어??");
    }
  };

  return (
    <div className={cn("help")}>
      <h1 className={cn("title")}>?��? ?�청?�기</h1>
      <div className={cn("helpContent")}>
        <h2 className={cn("secondTitle")}>?�약 ??�??�어주세??</h2>
        <ul className={cn("list")}>
          {checklist.map((text, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={checkedItems[i]}
                  onChange={() => handleCheck(i)}
                />
                <p>{text}</p>
              </label>
            </li>
          ))}
        </ul>
        <button
          className={cn("nextButton", { nextButtonDisabled: !allChecked })}
          onClick={handleNext}
        >
          ?�인
        </button>
      </div>
      <div className={cn("bannerWrapper")}>
        <Image src={banner} alt="배너" fill className={cn("bannerImage")} />
      </div>
    </div>
  );
}