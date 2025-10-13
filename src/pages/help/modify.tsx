import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Modify.module.scss";
import Image from "next/image"
import classNames from "classnames/bind";
import DateTimeSelector from "@/components/Calendar/DateTimeSelector";
import { postReservation } from "@/lib/apis/reservation";
import { useUserStore } from "@/lib/store/userStore"; 

const cn = classNames.bind(styles);

import people from "@/public/helpModify_people.svg"
import house from "@/public/helpModify_house.svg"
import male from "@/public/reservate_male.svg"
import female from "@/public/reservate_female.svg"
import both from "@/public/reservate_both.svg"

export default function ModifyPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [type, setType] = useState<"personal" | "org">("personal");
  const [recipientGenderType, setRecipientGenderType] = useState<"남" | "여" | null>("남");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [requirement, setRequirement] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  // 달력 변경 시 validation 상태 초기화
  const handleDateTimeChange = (data: any) => {
    // 날짜는 ISO 문자열로 전송
    setVisitDate(data.visitDate.toISOString());
    
    // 시간은 HH:mm 형식으로 전송 (LocalTime 형식)
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    setStartTime(formatTime(data.startTime));
    setEndTime(formatTime(data.endTime));
    
    // 달력 변경 시 에러 상태 초기화
    setShowErrors(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    // 필수 필드 검증
    const hasErrors = !name || !phoneNumber || !address || !requirement || !recipientNumber || !specialNotes;

    if (!hasErrors) {
      try {
        const payload = {
          name,
          phoneNumber,
          visitDate,
          startTime,
          endTime,
          address,
          requirement,
          recipientGenderType,
          recipientNumber,
        };
  
        // 사용자 타입에 따라 적절한 API 호출
        const userType = user?.type || 'personal';
        console.log('현재 사용자:', user);
        console.log('사용자 타입:', userType);
        
        const res = await postReservation(payload, userType);
        console.log(res);
        if (res) {
          router.push("/help/complete");
        } else {
          alert("예약에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (err) {
        console.error(err);
        alert("서버 에러가 발생했습니다.");
      }
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
            <label>이름 <span className={cn("required")}>(필수)</span></label>
            <input type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} className={showErrors && !name ? cn("error") : undefined}  />
            {showErrors && !name && <p className={cn("errorMsg")}>이름을 입력해주세요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>전화번호 <span className={cn("required")}>(필수)</span></label>
            <input type="text" placeholder="010-0000-0000" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={showErrors && !phoneNumber ? cn("error") : undefined} />
            {showErrors && !phoneNumber && <p className={cn("errorMsg")}>전화번호를 입력해주세요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>방문 주소 <span className={cn("required")}>(필수)</span></label>
            <input type="text" placeholder="주소를 입력해주세요" value={address} onChange={(e) => setAddress(e.target.value)} className={showErrors && !address ? cn("error") : undefined} />
            {showErrors && !address && <p className={cn("errorMsg")}>주소를 입력해주세요.</p>}
          </div>

          {/* 달력 자리 */}
          <DateTimeSelector onChange={handleDateTimeChange} />

          {/* 도움 요청 내용 */}
          <div className={cn("inputGroup")}>
            <label>도움 요청 내용 <span className={cn("required")}>(필수)</span></label>
            <input 
              type="text" 
              placeholder="도움 요청 내용을 입력해주세요" 
              value={requirement} 
              onChange={(e) => setRequirement(e.target.value)} 
              className={showErrors && !requirement ? cn("error") : undefined} 
            />
            {showErrors && !requirement && <p className={cn("errorMsg")}>도움 요청 내용을 입력해주세요.</p>}
          </div>

          {/* 성별 선택 */}
          <div className={cn("inputGroup")}>
            <label>도움 받는 사람의 성별</label>
            <div className={cn("toggleGroup")}>
              {([
                { value: "남", label: "남자", src: male },
                { value: "여", label: "여자", src: female },
              ] as const).map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setRecipientGenderType(g.value)}
                  className={`${cn("toggleButton")} ${
                    recipientGenderType === g.value ? cn("active") : ""
                  }`}
                >
                  <Image src={g.src} width={80} height={80} alt="성별 선택" />
                  <p className={cn("genderTitle")}>{g.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 사람 수 */}
          <div className={cn("inputGroup")}>
            <label>도움 받는 사람 수 <span className={cn("required")}>(필수)</span></label>
            <input 
              type="text" 
              placeholder="1" 
              value={recipientNumber} 
              onChange={(e) => setRecipientNumber(e.target.value)} 
              className={showErrors && !recipientNumber ? cn("error") : undefined} 
            />
            {showErrors && !recipientNumber && <p className={cn("errorMsg")}>도움 받는 사람 수를 입력해주세요.</p>}
          </div>

          {/* 특이사항 */}
          <div className={cn("inputGroup")}>
            <label>특이사항 <span className={cn("required")}>(필수)</span></label>
            <input 
              type="text" 
              placeholder="특이사항을 입력해주세요" 
              value={specialNotes} 
              onChange={(e) => setSpecialNotes(e.target.value)} 
              className={showErrors && !specialNotes ? cn("error") : undefined} 
            />
            {showErrors && !specialNotes && <p className={cn("errorMsg")}>특이사항을 입력해주세요.</p>}
          </div>

          <button type="submit" className={cn("submitBtn")}>
            예약하기
          </button>
        </form>
      </main>
    </div>
  );
}
