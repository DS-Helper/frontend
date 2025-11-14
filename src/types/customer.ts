export interface Inquiry {
  id: number | string;
  status: "답변 보기" | "답변 대기";
  content: string;
  date: string;
  time: string;
  image?: string;
  imageUrls?: string[];
  answer?: string | null;
  reply?: {
    replyId: string;
    content: string;
    user?: {
      userId: string;
      name: string;
      email?: string | null;
      role: string;
    };
  } | null;
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
