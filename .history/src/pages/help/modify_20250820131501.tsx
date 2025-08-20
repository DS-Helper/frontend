import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Modify.module.scss";
import Image from "next/image"
import classNames from "classnames/bind";
import DateTimeSelector from "@/components/Calendar/DateTimeSelector";

const cn = classNames.bind(styles);

import people from "@/public/helpModify_people.svg"
import house from "@/public/helpModify_house.svg"


export default function ModifyPage() {
  const router = useRouter();
  const [type, setType] = useState<"personal" | "org">("personal");
  const [gender, setGender] = useState<"male" | "female" | "both" | null>("male");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [validation, setValidation] = useState<{ [key: string]: string }>({});

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newValidation: { [key: string]: string } = {};

    if (!name) {
      newValidation.name = "error";
    } else {
      newValidation.name = "success";
    }

    if (!phoneNumber) {
      newValidation.phoneNumber = "error";
    } else {
      newValidation.phoneNumber = "success";
    }

    if (!address) {
      newValidation.address = "error";
    } else {
      newValidation.address = "success";
    }

    setValidation(newValidation);

    if (Object.values(newValidation).every((v) => v === "success")) {
      alert("예약이 완료되었습니다!");
      router.push("/");
    }
  };

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <form onSubmit={handleSubmit} className={cn("form")}>
          <h2 className={cn("title")}>정보 입력</h2>

          {/* 개인/기관 선택 */}
          <div className={cn("toggleGroup")}>
            <button
              type="button"
              onClick={() => setType("personal")}
              className={`${cn("toggleButton")} ${
                type === "personal" ? cn("active") : ""
              }`}
            >
              <Image src={people} width={80} height={80} alt='개인 회원' className={cn("buttonImage")} />
              <p className={cn("toggleLabel")}>개인</p>
            </button>
            <button
              type="button"
              onClick={() => setType("org")}
              className={`${cn("toggleButton")} ${
                type === "org" ? cn("active") : ""
              }`}
            >
              <Image src={house} width={80} height={80} alt="기관 회원" />
              <p className={cn("toggleLabel")}>기관</p>
            </button>
          </div>

          {/* 입력 필드 */}
          <div className={cn("inputGroup")}>
            <label>이름</label>
            <input type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} className={cn(validation.name)}  />
            {validation.name === "error" && <p className={cn("errorMsg")}>이름을 입력해주세요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>전화번호</label>
            <input type="text" placeholder="010-0000-0000" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={cn(validation.phoneNumber)} />
            {validation.phoneNumber === "error" && <p className={cn("errorMsg")}>전화번호를 입력해주세요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>방문 주소</label>
            <input type="text" placeholder="주소를 입력해주세요" value={address} onChange={(e) => setAddress(e.target.value)} className={cn(validation.address)} />
            {validation.address === "error" && <p className={cn("errorMsg")}>주소를 입력해주세요.</p>}
          </div>

          {/* 달력 자리 */}
          <DateTimeSelector />

          {/* 도움 요청 내용 */}
          <div className={cn("inputGroup")}>
            <label>도움 요청 내용</label>
            <input placeholder="Placeholder" />
          </div>

          {/* 성별 선택 */}
          <div className={cn("inputGroup")}>
            <label>도움 받는 사람의 성별</label>
            <div className={cn("toggleGroup")}>
              {[
                { value: "male", label: "남자", icon: "♂" },
                { value: "female", label: "여자", icon: "♀" },
                { value: "both", label: "둘 다 있음", icon: "⚥" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value as any)}
                  className={`${cn("toggleButton")} ${
                    gender === g.value ? cn("active") : ""
                  }`}
                >
                  <span className={cn("icon")}>{g.icon}</span>
                  <p>{g.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 사람 수 */}
          <div className={cn("inputGroup")}>
            <label>도움 받는 사람 수</label>
            <input placeholder="1명" />
          </div>

          {/* 특이사항 */}
          <div className={cn("inputGroup")}>
            <label>특이사항</label>
            <input placeholder="Placeholder" />
          </div>

          <button type="submit" className={cn("submitBtn")}>
            예약하기
          </button>
        </form>
      </main>
    </div>
  );
}
