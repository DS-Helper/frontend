import styles from "@/styles/Help.module.scss";
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

export default function Help(){
    return (
        <div className={cn("help")}>
            <h1>Help</h1>
        </div>
    );
}