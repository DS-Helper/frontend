import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';
import 

const cn = classNames.bind(styles);

export default function Help(){
  return (
    <div className={cn("help")}>
      <h1 className={cn("title")}>도움 요청하기</h1>
      <div className={cn("helpContent")}>
        <h2 className={cn("secondTitle")}>예약 전 꼭 읽어주세요!</h2>
        <ul className={cn("list")}>
          <li>
            <input type="checkbox" />
            <p>방문시간은 주말 오전 10시 ~ 오후 5시 사이만 가능해요.</p>
          </li>
          <li>
            <input type="checkbox" />
            <p>최소 30분, 최대 3시간까지 예약 할 수 있어요.</p>
          </li>
          <li>
            <input type="checkbox" />
            <p>예약 완료 전에는 추가 예약이 불가해요.</p>
          </li>
          <li>
            <input type="checkbox" />
            <p>도움 요청 내용은 자세히 작성 해주시면 보다 정확하고 따뜻한  동행이 가능해요</p>
          </li>
        </ul>
        <button className={cn("nextButton")}>확인</button>
        <Image />
      </div>
    </div>
  );
}