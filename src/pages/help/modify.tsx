import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Modify.module.scss";
import Image from "next/image"
import classNames from "classnames/bind";
import DateTimeSelector from "@/components/Calendar/DateTimeSelector";
import { postPersonalReservation } from "@/lib/apis/reservationUser";
import { postOrganizationReservation } from "@/lib/apis/reservationOrg";
import { useUserStore } from "@/lib/store/userStore"; 

const cn = classNames.bind(styles);

import people from "@/public/helpModify_people.svg"
import house from "@/public/helpModify_house.svg"
import male from "@/public/reservate_male.svg"
import female from "@/public/reservate_female.svg"
import both from "@/public/reservate_both.svg"

export default function ModifyPage() {
  const router = useRouter();
  const { user, userType } = useUserStore();
  const [type, setType] = useState<"personal" | "org">("personal");
  const [recipientGenderType, setRecipientGenderType] = useState<"남" | "여" | "모두" | null>("남");

  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [requirement, setRequirement] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  // 사용자 타입에 따라 자동으로 개인/기관 선택
  useEffect(() => {
    if (userType === 'organization') {
      setType('org');
    } else {
      setType('personal');
    }
  }, [userType]);

  // 휴대폰 번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      // 010-000 형식
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      // 10자리: 010-000-0000 형식
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      // 11자리: 010-0000-0000 형식
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 휴대폰 번호 입력 핸들러
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedValue);
  };

  // 휴대폰 번호 검증 함수
  const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    // 숫자만 있고 10자리 또는 11자리인지 확인
    return /^\d{10,11}$/.test(numbers);
  };

  // 도움받는 사람 수 검증 함수
  const validateRecipientNumber = (number: string): boolean => {
    // 숫자만 있고 1 이상의 정수인지 확인
    return /^\d+$/.test(number) && parseInt(number) > 0;
  };

  // 숫자만 입력 가능한 핸들러
  const handleNumberOnlyChange = (value: string, setter: (value: string) => void) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    setter(numbers);
  };

  // 달력 변경 시 validation 상태 초기화
  const handleDateTimeChange = (data: any) => {
    // 날짜를 로컬 시간 기준으로 YYYY-MM-DD 형식으로 변환
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 로컬 날짜 문자열로 저장 (ISO 문자열 대신)
    setVisitDate(formatLocalDate(data.visitDate));
    
    // 시간은 HH:mm 형식으로 전송 (LocalTime 형식)
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    setStartTime(formatTime(data.startTime));
    setEndTime(formatTime(data.endTime));
    
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 휴대폰 번호 형식 검증
    if (!validatePhoneNumber(phoneNumber)) {
      alert("휴대폰 번호를 올바르게 입력해주세요.\n예: 010-1234-5678 또는 010-123-4567");
      return;
    }

    // 도움받는 사람 수 검증
    if (!validateRecipientNumber(recipientNumber)) {
      alert("도움받는 사람 수를 올바르게 입력해주세요.\n숫자만 입력 가능하며, 1 이상의 값을 입력해주세요.");
      return;
    }

    // 검증 통과 후 에러 상태 표시
    setShowErrors(true);

    // 필수 필드 검증
    const hasErrors = !name || !phoneNumber || !address || !requirement || !recipientNumber || !specialNotes || (type === 'org' && !organizationName);

    if (!hasErrors) {
      try {
        // visitDate는 이미 YYYY-MM-DD 형식이므로 그대로 사용
        const formattedVisitDate = visitDate;

        const payload = type === 'personal' 
          ? {
              name,
              phoneNumber,
              visitDate: formattedVisitDate,
              startTime,
              endTime,
              address,
              requirement,
              recipientGenderType,
              recipientNumber,
            }
          : {
              name,
              organizationName,
              phoneNumber,
              visitDate: formattedVisitDate,
              startTime,
              endTime,
              address,
              requirement,
              recipientGenderType,
              recipientNumber,
            };
  
        // 사용자 타입에 따라 적절한 API 호출
        console.log('현재 사용자:', user);
        console.log('선택된 타입:', type);
        console.log('전송할 payload:', payload);
        
        let res;
        try {
          res = type === 'personal' 
            ? await postPersonalReservation(payload)
            : await postOrganizationReservation(payload);
        } catch (apiError: any) {
          // 403 에러인 경우 중복 예약 불가 메시지 표시
          if (apiError?.response?.status === 403) {
            alert("대기중인 예약이 있는 경우 중복 예약이 불가합니다.");
            return;
          }
          // 다른 에러는 다시 throw하여 아래 catch 블록에서 처리
          throw apiError;
        }
        
        console.log(res);
        if (res) {
          router.push("/help/complete");
        } else {
          alert("예약에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (err: any) {
        console.error(err);
        // 403 에러는 이미 위에서 처리했으므로 여기서는 다른 에러만 처리
        if (err?.response?.status !== 403) {
          alert("서버 에러가 발생했습니다.");
        }
      }
    }
  };

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <h2 className={cn("title")}>정보 입력</h2>

        {/* 달력 자리 - form 밖으로 이동 */}
        <DateTimeSelector onChange={handleDateTimeChange} />

        <form onSubmit={handleSubmit} className={cn("form")}>
          {/* 개인/기관 선택 */}
          <div className={cn("toggleGroup")}>
            <button
              type="button"
              onClick={() => setType("personal")}
              disabled={userType === 'organization'}
              className={`${cn("toggleButton")} ${
                type === "personal" ? cn("active") : ""} 
                ${userType === 'organization' ? cn("disabled") : ""}`}
            >
              <Image src={people} width={80} height={80} alt='개인 회원' className={cn("buttonImage")} />
              <p className={cn("toggleLabel")}>개인</p>
              <span className={cn("toggleDescription")}>당사자가 아닌, 보호자도 신청 가능!</span>
            </button>
            <button
              type="button"
              onClick={() => setType("org")}
              disabled={userType === 'individual'}
              className={`${cn("toggleButton")} ${
                type === "org" ? cn("active") : ""} 
                ${userType === 'individual' ? cn("disabled") : ""}`}
            >
              <Image src={house} width={80} height={80} alt="기관 회원" className={cn("buttonImage")} />
              <p className={cn("toggleLabel")}>기관</p>
            </button>
          </div>

          {/* 입력 필드 */}
          <div className={cn("inputGroup")}>
            <label>이름 <span className={cn("required")}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={showErrors && !name ? cn("error") : undefined}  />
            {showErrors && !name && <p className={cn("errorMsg")}>이름을 입력해주세요.</p>}
          </div>

          {/* 기관 이름 필드 (기관 사용자만 표시) */}
          {type === 'org' && (
            <div className={cn("inputGroup")}>
              <label>기관 이름 <span className={cn("required")}>^</span></label>
              <input 
                type="text"
                value={organizationName} 
                onChange={(e) => setOrganizationName(e.target.value)} 
                className={showErrors && !organizationName ? cn("error") : undefined}  
              />
              {showErrors && !organizationName && <p className={cn("errorMsg")}>기관 이름을 입력해주세요.</p>}
            </div>
          )}

          <div className={cn("inputGroup")}>
            <label>전화번호 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={handlePhoneNumberChange}
              maxLength={13}
              className={showErrors && !phoneNumber ? cn("error") : undefined} 
            />
            {showErrors && !phoneNumber && <p className={cn("errorMsg")}>전화번호를 입력해주세요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>방문 주소 <span className={cn("required")}>*</span></label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={showErrors && !address ? cn("error") : undefined} />
            {showErrors && !address && <p className={cn("errorMsg")}>주소를 입력해주세요.</p>}
          </div>

          {/* 도움 요청 내용 */}
          <div className={cn("inputGroup")}>
            <label>도움 요청 내용 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
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
                { value: "모두", label: "둘 다 있음", src: both },
              ] as const).map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setRecipientGenderType(g.value)}
                  className={`${cn("toggleButton")} ${
                    recipientGenderType === g.value ? cn("active") : ""
                  }`}
                >
                  <Image src={g.src} width={80} height={80} alt="성별 선택" className={cn("buttonImage")} />
                  <p className={cn("genderTitle")}>{g.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 사람 수 */}
          <div className={cn("inputGroup")}>
            <label>도움 받는 사람 수 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
              value={recipientNumber} 
              onChange={(e) => handleNumberOnlyChange(e.target.value, setRecipientNumber)} 
              className={showErrors && !recipientNumber ? cn("error") : undefined} 
            />
            {showErrors && !recipientNumber && <p className={cn("errorMsg")}>도움 받는 사람 수를 입력해주세요.</p>}
          </div>

          {/* 특이사항 */}
          <div className={cn("inputGroup")}>
            <label>특이사항 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
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
