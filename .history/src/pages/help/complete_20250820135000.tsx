import styles from "@/styles/Modify.module.scss";
import classNames from "classnames/bind";
import Image from ""
import image from "@/public/reservation_com.svg"

const cn = classNames.bind(styles);

export default function HelpComplete() {
  return (
    <div>
      <h1>도움 요청이 접수되었어요</h1>
      <p>헬퍼가 예약 내용을 확인한 후 확정 여부를 알려드릴게요.
      <br /> 확정되면 알림을 보내드릴 예정이에요.</p>
      <Image />
    </div>
  )
};