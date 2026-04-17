import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../../styles/PhoneVerifyModal.module.scss";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";

const cn = classNames.bind(styles);

/** ?�자�?추출 ??010-XXXX-XXXX / 010-XXX-XXXX ?�식?�로 ?�동 ?�이???�맷 */
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith("010")) {
    const rest = digits.slice(3);
    if (rest.length <= 4) return `010-${rest}`;
    if (rest.length <= 7) return `010-${rest.slice(0, 3)}-${rest.slice(3)}`;
    return `010-${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }
  return digits.slice(0, 3) + "-" + digits.slice(3);
}

const TIMER_SECONDS = 3 * 60; // 3�?

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface PhoneVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCode?: (phone: string) => void;
  onVerifyCode?: (code: string) => void;
}

export default function PhoneVerifyModal({
  isOpen,
  onClose,
  onRequestCode,
  onVerifyCode,
}: PhoneVerifyModalProps) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "success">("phone");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [phoneSent, setPhoneSent] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setStep("phone");
    setCode("");
    setPhone("");
    setPhoneSent("");
    setSecondsLeft(TIMER_SECONDS);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || step !== "code") return;
    const tick = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [isOpen, step]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length >= 10) {
      onRequestCode?.(digitsOnly);
      setPhoneSent(digitsOnly);
      setStep("code");
      setCode("");
      setSecondsLeft(TIMER_SECONDS);
    }
  };

  const handleResend = () => {
    if (secondsLeft <= 0) return;
    onRequestCode?.(phoneSent);
    setSecondsLeft(TIMER_SECONDS);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerifyCode?.(code);
    setStep("success");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn("overlay")}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        step === "phone"
          ? "phoneVerifyTitle"
          : step === "code"
            ? "codeVerifyTitle"
            : "successTitle"
      }
    >
      <div
        className={cn("modalBox", { modalBoxSuccess: step === "success" })}
        onClick={(e) => e.stopPropagation()}
      >
        {step !== "success" && (
          <button
            type="button"
            className={cn("closeButton")}
            onClick={handleClose}
            aria-label="모달 ?�기"
          >
            <IoCloseOutline size={30} className={cn("closeIcon")} />
          </button>
        )}

        {step === "phone" ? (
          <>
            <h2 id="phoneVerifyTitle" className={cn("title")}>
              ?�화번호�??�력?�주?�요!
            </h2>
            <form onSubmit={handleRequestCode} className={cn("form")}>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className={cn("input")}
                placeholder="010-xxxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                autoFocus
                aria-describedby="phoneVerifyDesc"
              />
              <p id="phoneVerifyDesc" className={cn("helperText")}>
                카카?�톡 ?�림?�으�?발송?�며, ?�신 불�? ??SMS�??�체됩?�다.
              </p>
              <button type="submit" className={cn("submitButton")}>
                ?�증번호 받기
              </button>
            </form>
          </>
        ) : step === "code" ? (
          <>
            <h2 id="codeVerifyTitle" className={cn("title")}>
              ?�증번호�??�력?�주?�요!
            </h2>
            <form onSubmit={handleVerifySubmit} className={cn("form", "formCode")}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className={cn("input")}
                placeholder="XXXXXX"
                value={code}
                onChange={handleCodeChange}
                autoFocus
                aria-describedby="codeVerifyDesc"
              />
              <p id="codeVerifyDesc" className={cn("helperText")}>
                카카?�톡 ?�림?�으�?발송?�며, ?�신 불�? ??SMS�??�체됩?�다.
              </p>
              <div className={cn("resendRow")}>
                <button
                  type="button"
                  className={cn("resendButton")}
                  onClick={handleResend}
                  disabled={secondsLeft <= 0}
                >
                  ?�전??
                </button>
                <span className={cn("timer", { expired: secondsLeft <= 0 })}>
                  {formatTimer(secondsLeft)}
                </span>
              </div>
              <button type="submit" className={cn("submitButton")}>
                ?�인
              </button>
            </form>
          </>
        ) : (
          <div className={cn("successContent")}>
            <div className={cn("successIcon")}>
              <Image
                src="/profileCheck.svg"
                alt="?�증 ?�료"
                width={64}
                height={64}
                className={cn("successCheckmark")}
              />
            </div>
            <h2 id="successTitle" className={cn("successTitle")}>
              ?�증???�료?�었?�니??
            </h2>
            <button
              type="button"
              className={cn("submitButton")}
              onClick={handleClose}
            >
              ?�인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
