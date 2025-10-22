export interface Inquiry {
  id: number;
  status: "답변 보기" | "답변 대기";
  content: string;
  date: string;
  time: string;
  image?: string;
  answer?: string | null;
}

export interface InquiryFormData {
  inquiryType: string;
  content: string;
  images?: File[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
