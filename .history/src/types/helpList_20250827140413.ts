
type HelpRequestStatus = "예정" | "완료" | "취소";

interface HelpRequest {
  id: string;
  date: string;
  dayOfWeek: string;
  status: HelpRequestStatus;
  content: string;
  startTime: string;
  endTime: string;
}
