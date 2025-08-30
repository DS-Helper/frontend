import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

export default function Help(){
  return (
    <div className={cn("help")}>
      <h1 className={cn("helpTitle")}>도움 요청하기</h1>
      <div className={cn("helpContent")}>
          <h2 className={cn("helpContentLeftTitle")}>예약 전 꼭 읽어주세요!</h2>
          <ul>
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
              <p>방문시간은 주말 오전 10시 ~ 오후 5시 사이만 가능해요.</p>
            </li>
          </ul>
      </div>
    </div>
  );
}