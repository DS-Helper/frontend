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