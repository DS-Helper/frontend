export type HelpRequestStatus = "예정" | "완료" | "취소";

export interface HelpRequest {
  id: string;
  date: string;
  dayOfWeek: string;
  status: HelpRequestStatus;
  content: string;
  startTime: string;
  endTime: string;
}

export interface HelpDetailData {
  id: string;
  applicantInfo: {
    name: string;
    contact: string;
  };
  location: string;
  recipientInfo: {
    gender: string;
    count: number;
  };
  specialNotes: string;
  rejectionReason?: string;
}