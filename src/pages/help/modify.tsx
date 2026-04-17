import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/Modify.module.scss";
import Image from "next/image"
import classNames from "classnames/bind";
import DateTimeSelector from "@/components/Calendar/DateTimeSelector";
import {
  getPersonalReservation,
  postPersonalReservation,
} from "@/lib/apis/reservationUser";
import { postOrganizationReservation } from "@/lib/apis/reservationOrg";
import { useUserStore } from "@/lib/store/userStore";
import { loadDaumPostcodeScript } from "@/lib/daum/loadPostcodeScript";

const cn = classNames.bind(styles);

import people from "@/public/helpModify_people.svg"
import house from "@/public/helpModify_house.svg"
import male from "@/public/reservate_male.svg"
import female from "@/public/reservate_female.svg"
import both from "@/public/reservate_both.svg"

function formatAddressFromDaumPostcode(data: {
  userSelectedType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
}): string {
  const line = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
  const building = data.buildingName?.trim();
  return building ? `${line} ${building}` : line;
}

export default function ModifyPage() {
  const router = useRouter();
  const { user, userType } = useUserStore();
  const [type, setType] = useState<"personal" | "org">("personal");
  const [recipientGenderType, setRecipientGenderType] = useState<"?? | "?? | "모두" | null>("??);

  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [requirement, setRequirement] = useState("");
  const [recipientNumber, setRecipientNumber] = useState(1);
  const [note, setNote] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const [postcodeOpenError, setPostcodeOpenError] = useState<string | null>(null);
  const [postcodeLayerOpen, setPostcodeLayerOpen] = useState(false);
  const postcodeEmbedRef = useRef<HTMLDivElement | null>(null);

  // ?�용???�?�에 ?�라 ?�동?�로 개인/기�? ?�택
  useEffect(() => {
    if (userType === 'organization') {
      setType('org');
    } else {
      setType('personal');
    }
  }, [userType]);

  useEffect(() => {
    if (!postcodeLayerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPostcodeLayerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [postcodeLayerOpen]);

  useEffect(() => {
    if (!postcodeLayerOpen) return;
    const host = postcodeEmbedRef.current;
    if (!host) return;

    let cancelled = false;
    host.innerHTML = "";

    void (async () => {
      try {
        setPostcodeOpenError(null);
        await loadDaumPostcodeScript();
        if (cancelled || !host) return;
        const Postcode = window.daum?.Postcode;
        if (!Postcode) {
          throw new Error("?�편번호 ?�비?��? 불러?��? 못했?�니??");
        }
        new Postcode({
          oncomplete: (data) => {
            setPostcodeOpenError(null);
            setAddress(formatAddressFromDaumPostcode(data));
            setPostcodeLayerOpen(false);
          },
          onclose: () => {
            if (!cancelled) setPostcodeLayerOpen(false);
          },
          width: "100%",
          height: 480,
          animation: false,
        }).embed(host);
      } catch (e) {
        if (!cancelled) {
          setPostcodeOpenError(
            e instanceof Error ? e.message : "?�편번호 창을 ?????�습?�다.",
          );
          setPostcodeLayerOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      host.innerHTML = "";
    };
  }, [postcodeLayerOpen]);

  const openDaumPostcode = () => {
    setPostcodeOpenError(null);
    setPostcodeLayerOpen(true);
  };

  // ?��???번호 ?�맷???�수
  const formatPhoneNumber = (value: string) => {
    // ?�자�?추출
    const numbers = value.replace(/\D/g, '');
    
    // 길이???�라 ?�맷??
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      // 010-000 ?�식
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      // 10?�리: 010-000-0000 ?�식
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      // 11?�리: 010-0000-0000 ?�식
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // ?��???번호 ?�력 ?�들??
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedValue);
  };

  // ?��???번호 검�??�수
  const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    // ?�자�??�고 10?�리 ?�는 11?�리?��? ?�인
    return /^\d{10,11}$/.test(numbers);
  };

  // ?��?받는 ?�람 ??검�??�수
  const validateRecipientNumber = (number: number): boolean => {
    // 1 ?�상???�수?��? ?�인
    return Number.isInteger(number) && number > 0;
  };

  const getSelectedMinutes = (start: string, end: string): number => {
    const parse = (time: string): number | null => {
      const [hh, mm] = time.split(":");
      const h = Number(hh);
      const m = Number(mm);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
      return h * 60 + m;
    };
    const startMinutes = parse(start);
    const endMinutes = parse(end);
    if (startMinutes == null || endMinutes == null) return 0;
    return endMinutes - startMinutes;
  };

  // ?��?받는 ?�람 ??증감 ?�들??(최소 1�?
  const handleRecipientCountChange = (type: "increase" | "decrease") => {
    setRecipientNumber((prev) => {
      if (type === "decrease") {
        return Math.max(1, prev - 1);
      }
      return prev + 1;
    });
  };

  // ?�력 변�???validation ?�태 초기??
  const handleDateTimeChange = (data: any) => {
    // ?�짜�?로컬 ?�간 기�??�로 YYYY-MM-DD ?�식?�로 변??
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 로컬 ?�짜 문자?�로 ?�??(ISO 문자???�??
    setVisitDate(formatLocalDate(data.visitDate));
    
    // ?�간?� HH:mm ?�식?�로 ?�송 (LocalTime ?�식)
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    setStartTime(formatTime(data.startTime));
    setEndTime(formatTime(data.endTime));
    
  };

  const isFormValid =
    name.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    validatePhoneNumber(phoneNumber) &&
    address.trim() !== "" &&
    requirement.trim() !== "" &&
    validateRecipientNumber(recipientNumber) &&
    visitDate.trim() !== "" &&
    startTime.trim() !== "" &&
    endTime.trim() !== "" &&
    (type !== "org" || organizationName.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ?��???번호 ?�식 검�?
    if (!validatePhoneNumber(phoneNumber)) {
      alert("?��???번호�??�바르게 ?�력?�주?�요.\n?? 010-1234-5678 ?�는 010-123-4567");
      return;
    }

    // ?��?받는 ?�람 ??검�?
    if (!validateRecipientNumber(recipientNumber)) {
      alert("?��?받는 ?�람 ?��? ?�바르게 ?�력?�주?�요.\n?�자�??�력 가?�하�? 1 ?�상??값을 ?�력?�주?�요.");
      return;
    }

    if (getSelectedMinutes(startTime, endTime) < 30) {
      alert("?�간?� 30�??�상 ?�택?�주?�요.");
      return;
    }

    // 검�??�과 ???�러 ?�태 ?�시
    setShowErrors(true);

    // ?�수 ?�드 검�?(?�이?�항?� ?�택 ?�드)
    const hasErrors = !isFormValid;

    if (!hasErrors) {
      try {
        if (type === "personal") {
          const reservationCheckRes = await getPersonalReservation({
            params: { page: 0, size: 1 },
          });
          const existingReservations =
            reservationCheckRes?.data?.content ??
            reservationCheckRes?.data ??
            [];
          if (
            Array.isArray(existingReservations) &&
            existingReservations.length > 0
          ) {
            alert("?��? ?�청???�역???�습?�다.");
            return;
          }
        }

        // visitDate???��? YYYY-MM-DD ?�식?��?�?그�?�??�용
        const formattedVisitDate = visitDate;

        const fullAddress = detailAddress.trim()
          ? `${address} ${detailAddress.trim()}`
          : address;

        const payload = type === 'personal' 
          ? {
              name,
              phoneNumber,
              visitDate: formattedVisitDate,
              startTime,
              endTime,
              address: fullAddress,
              requirement,
              recipientGenderType,
              recipientNumber: String(recipientNumber),
              note,
            }
          : {
              name,
              organizationName,
              phoneNumber,
              visitDate: formattedVisitDate,
              startTime,
              endTime,
              address: fullAddress,
              requirement,
              recipientGenderType,
              recipientNumber: String(recipientNumber),
              note,
            };
  
        // ?�용???�?�에 ?�라 ?�절??API ?�출
        console.log('?�재 ?�용??', user);
        console.log('?�택???�??', type);
        console.log('?�송??payload:', payload);
        
        let res;
        try {
          res = type === 'personal' 
            ? await postPersonalReservation(payload)
            : await postOrganizationReservation(payload);
        } catch (apiError: any) {
          // 403 ?�러??경우 중복 ?�약 불�? 메시지 ?�시
          if (apiError?.response?.status === 403) {
            alert("?�기중???�약???�는 경우 중복 ?�약??불�??�니??");
            return;
          }
          // ?�른 ?�러???�시 throw?�여 ?�래 catch 블록?�서 처리
          throw apiError;
        }
        
        console.log(res);
        if (res) {
          router.push("/help/complete");
        } else {
          alert("?�약???�패?�습?�다. ?�시 ?�도?�주?�요.");
        }
      } catch (err: any) {
        console.error(err);
        // 403 ?�러???��? ?�에??처리?�으므�??�기?�는 ?�른 ?�러�?처리
        if (err?.response?.status !== 403) {
          alert("?�버 ?�러가 발생?�습?�다.");
        }
      }
    }
  };

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <h2 className={cn("title")}>?�보 ?�력</h2>

        {/* 개인/기�? ?�택 */}
        <div className={cn("toggleGroup")}>
          <button
            type="button"
            onClick={() => setType("personal")}
            disabled={userType === 'organization'}
            className={`${cn("toggleButton")} ${
              type === "personal" ? cn("active") : ""} 
              ${userType === 'organization' ? cn("disabled") : ""}`}
          >
            <Image src={people} width={80} height={80} alt='개인 ?�원' className={cn("buttonImage")} />
            <p className={cn("toggleLabel")}>개인</p>
            <span className={cn("toggleDescription")}>?�사?��? ?�닌, 보호?�도 ?�청 가??</span>
          </button>
          <button
            type="button"
            onClick={() => setType("org")}
            disabled={userType === 'individual'}
            className={`${cn("toggleButton")} ${
              type === "org" ? cn("active") : ""} 
              ${userType === 'individual' ? cn("disabled") : ""}`}
          >
            <Image src={house} width={80} height={80} alt="기�? ?�원" className={cn("buttonImage")} />
            <p className={cn("toggleLabel")}>기�?</p>
          </button>
        </div>

        {/* ?�력 ?�리 - form 밖으�??�동 */}
        <DateTimeSelector onChange={handleDateTimeChange} />

        <form onSubmit={handleSubmit} className={cn("form")}>
          {/* ?�력 ?�드 */}
          <div className={cn("inputGroup")}>
            <label>?�름 <span className={cn("required")}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={showErrors && !name ? cn("error") : undefined}  />
            {showErrors && !name && <p className={cn("errorMsg")}>?�름???�력?�주?�요.</p>}
          </div>

          {/* 기�? ?�름 ?�드 (기�? ?�용?�만 ?�시) */}
          {type === 'org' && (
            <div className={cn("inputGroup")}>
              <label>기�? ?�름 <span className={cn("required")}>*</span></label>
              <input 
                type="text"
                value={organizationName} 
                onChange={(e) => setOrganizationName(e.target.value)} 
                className={showErrors && !organizationName ? cn("error") : undefined}  
              />
              {showErrors && !organizationName && <p className={cn("errorMsg")}>기�? ?�름???�력?�주?�요.</p>}
            </div>
          )}

          <div className={cn("inputGroup")}>
            <label>?�화번호 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={handlePhoneNumberChange}
              maxLength={13}
              className={showErrors && !phoneNumber ? cn("error") : undefined} 
            />
            {showErrors && !phoneNumber && <p className={cn("errorMsg")}>?�화번호�??�력?�주?�요.</p>}
          </div>

          <div className={cn("inputGroup")}>
            <label>방문 주소 <span className={cn("required")}>*</span></label>
            <input
              type="text"
              value={address}
              readOnly
              onClick={openDaumPostcode}
              placeholder="주소 검??
              title="?�편번호 검??
              aria-label="?�편번호 검???�기"
              className={`${cn("addressReadonlyInput")} ${
                showErrors && !address ? cn("error") : ""
              }`}
            />
            {showErrors && !address && (
              <p className={cn("errorMsg")}>주소�??�력?�주?�요.</p>
            )}
            {postcodeOpenError && (
              <p className={cn("errorMsg")} role="alert">
                {postcodeOpenError}
              </p>
            )}
          </div>

          <div className={cn("inputGroup")}>
            <label>?�세 주소</label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </div>

          {/* ?��? ?�청 ?�용 */}
          <div className={cn("inputGroup")}>
            <label>?��? ?�청 ?�용 <span className={cn("required")}>*</span></label>
            <input 
              type="text" 
              value={requirement} 
              onChange={(e) => setRequirement(e.target.value)} 
              className={showErrors && !requirement ? cn("error") : undefined} 
            />
            {showErrors && !requirement && <p className={cn("errorMsg")}>?��? ?�청 ?�용???�력?�주?�요.</p>}
          </div>

          {/* ?�별 ?�택 */}
          <div className={cn("inputGroup")}>
            <label>?��? 받는 ?�람???�별</label>
            <div className={cn("toggleGroup")}>
              {([
                { value: "??, label: "?�자", src: male },
                { value: "??, label: "?�자", src: female },
                { value: "모두", label: "?????�음", src: both },
              ] as const).map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setRecipientGenderType(g.value)}
                  className={`${cn("toggleButton")} ${
                    recipientGenderType === g.value ? cn("active") : ""
                  }`}
                >
                  <Image src={g.src} width={80} height={80} alt="?�별 ?�택" className={cn("buttonImage")} />
                  <p className={cn("genderTitle")}>{g.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ?�람 ??*/}
          <div className={cn("inputGroup")}>
            <label>?��? 받는 ?�람 ??<span className={cn("required")}>*</span></label>
            <div className={cn("recipientCountControl")}>
              <button
                type="button"
                className={cn("countButton")}
                onClick={() => handleRecipientCountChange("increase")}
                aria-label="?��? 받는 ?�람 ??증�?"
              >
                +
              </button>
              <span className={cn("countValue")} aria-live="polite">
                {recipientNumber}
              </span>
              <button
                type="button"
                className={cn("countButton")}
                onClick={() => handleRecipientCountChange("decrease")}
                disabled={recipientNumber <= 1}
                aria-label="?��? 받는 ?�람 ??감소"
              >
                -
              </button>
            </div>
            {showErrors && recipientNumber < 1 && <p className={cn("errorMsg")}>?��? 받는 ?�람 ?��? ?�력?�주?�요.</p>}
          </div>

          {/* ?�이?�항 */}
          <div className={cn("inputGroup")}>
            <label>?�이?�항</label>
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
            />
          </div>

          <button
            type="submit"
            className={cn("submitBtn", { disabled: !isFormValid })}
            disabled={!isFormValid}
          >
            ?�약?�기
          </button>
        </form>
      </main>

      {postcodeLayerOpen && (
        <div
          className={cn("postcodeLayerBackdrop")}
          role="presentation"
          onClick={() => setPostcodeLayerOpen(false)}
        >
          <div
            className={cn("postcodeLayerPanel")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="postcodeLayerTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn("postcodeLayerHeader")}>
              <h3 id="postcodeLayerTitle" className={cn("postcodeLayerTitle")}>
                주소 검??
              </h3>
              <button
                type="button"
                className={cn("postcodeLayerClose")}
                onClick={() => setPostcodeLayerOpen(false)}
                aria-label="?�기"
              >
                ×
              </button>
            </div>
            <div
              ref={postcodeEmbedRef}
              className={cn("postcodeEmbedHost")}
              aria-label="?�편번호 검??
            />
          </div>
        </div>
      )}
    </div>
  );
}
