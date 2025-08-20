import { useState } from "react";
import { useRouter } from "next/router";
import Calendar from "react-calendar";
import styles from "@/styles/Modify.module.scss";
import Image from "next/image"
import classNames from "classnames/bind";

const cn = classNames.bind(styles);
type TimeSlot = string;

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);

    const reservedTimes: { [key: string]: TimeSlot[] } = {
    "2024-12-14": ["10:00", "10:30", "14:00"],
  };

  const getTimes = () => {
    const times: TimeSlot[] = [];
    for (let hour = 10; hour <= 17; hour++) {
      for (let min of [0, 30]) {
        if (!(hour === 17 && min === 30)) {
          times.push(`${hour.toString().padStart(2, "0")}:${min === 0 ? "00" : "30"}`);
        }
      }
    }
    return times;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimes([]);
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const reserved = reservedTimes[dateKey] || [];

    if (reserved.includes(time)) return; // 예약 불가

    let newTimes = [...selectedTimes];
    if (newTimes.includes(time)) {
      newTimes = newTimes.filter((t) => t !== time);
    } else {
      newTimes.push(time);
    }

    // 최소 30분 이상, 최대 3시간 이하
    newTimes.sort();
    const duration = newTimes.length * 30; // 분 단위
    if (duration > 180) return; // 3시간 초과 방지

    setSelectedTimes(newTimes);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0), 토요일(6)
  };

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
          <div className={cn("inputGroup")}>
            <label>
              날짜 및 시간 <span className={cn("required")}>(필수)</span>
            </label>
            <div className={cn("calendarPlaceholder")}>
              <Calendar
                locale="customKo"
                onChange={(value) => handleDateChange(value as Date)}
                value={selectedDate}
                tileDisabled={({ date }) => !isWeekend(date)}
              />

              {selectedDate && (
                <div>
                  <h3>시간 선택</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {getTimes().map((time) => {
                      const dateKey = selectedDate.toISOString().split("T")[0];
                      const reserved = reservedTimes[dateKey] || [];
                      const isReserved = reserved.includes(time);
                      const isSelected = selectedTimes.includes(time);

                      return (
                        <button
                          key={time}
                          onClick={() => handleTimeClick(time)}
                          disabled={isReserved}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isSelected ? "2px solid green" : "1px solid #ccc",
                            background: isReserved ? "#eee" : isSelected ? "#c7f9cc" : "white",
                            cursor: isReserved ? "not-allowed" : "pointer",
                          }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedTimes.length > 0 && (
                <p>선택된 시간: {selectedTimes.join(", ")}</p>
              )}
            </div>
          </div>

          {/* 시간 선택 */}
          <div className={cn("timeButtons")}>
            <button className={`${cn("timeBtn")} ${cn("active")}`}>16:00 시작</button>
            <button className={cn("timeBtn")}>16:30</button>
            <button className={cn("timeBtn")}>17:00 종료</button>
          </div>

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
