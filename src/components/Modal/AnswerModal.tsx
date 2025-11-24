import React from "react";
import classNames from "classnames/bind";
import styles from "@/styles/Customer.module.scss";

const cn = classNames.bind(styles);

interface AnswerModalProps {
  answer: string;
  onClose: () => void;
}

export default function AnswerModal({ answer, onClose }: AnswerModalProps) {
  return (
    <div className={cn("answerModalOverlay")} onClick={onClose}>
      <div className={cn("answerModalContent")} onClick={(e) => e.stopPropagation()}>
        <div className={cn("answerModalHeader")}>
          <h2 className={cn("answerModalTitle")}>답변 내용</h2>
          <button className={cn("answerModalCloseBtn")} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={cn("answerModalBody")}>
          <pre className={cn("answerModalText")}>{answer}</pre>
        </div>
      </div>
    </div>
  );
}

