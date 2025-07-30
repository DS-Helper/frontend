import styles from "@/styles/Home.module.scss"; // Help에서 사용될 CSS정의해놓은 경로에서 가져오기
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

export default function Help(){
    return (
        <div>
            <h1> This is help page.</h1>
        </div>
    );
} 