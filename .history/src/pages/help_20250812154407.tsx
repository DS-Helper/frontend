import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

export default function Help(){
    return (
      <div className={cn("help")}>
          <h1 className={cn("helpTitle")}>도움 요청하기</h1>
          <div className={cn("helpContent")}>
              <div className={cn("helpContentLeft")}>
                  <h2 className={cn("helpContentLeftTitle")}>도움 요청하기</h2>
              </div>
          </div>
      </div>
    );
}