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
              <input  />
            </li>
          </ul>
      </div>
    </div>
  );
}