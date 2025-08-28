export type HelpRequestStatus = "예정" | "완료" | "취소";

export interface HelpRequest {
  id: string;
  userId: string;
  date: string;
  dayOfWeek: string;
  status: HelpRequestStatus;
  content: string;
  startTime: string;
  endTime: string;
}

export interface HelpDetailData {
  id: string;
  userId: string;
  applicantInfo: {
    name: string;
    contact: string;
    organizationName?: string; // 기업 유저용 기관명
  };
  location: string;
  recipientInfo: {
    gender: string;
    count: number;
  };
  specialNotes: string;
  rejectionReason?: string;
}