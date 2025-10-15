export type HelpRequestStatus = "대기" | "완료" | "취소";

// API 응답 데이터 타입
export interface ApiReservationData {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  address: string;
  endTime: string;
  name: string;
  phoneNumber: string;
  recipientGender: string;
  recipientNumber: number;
  requirement: string;
  reservationStatus: string;
  startTime: string;
  visitDate: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    gender: string;
    ageRange: string;
    birthday: string | null;
    birthyear: string | null;
    type: string;
    role: string;
    profileImageUrl: string | null;
    googleOauthConnected: boolean;
    kakaoOauthConnected: boolean;
    naverOauthConnected: boolean;
    localAuthConnected: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
}

// UI에서 사용하는 변환된 데이터 타입
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
  specialNotes?: string;
  rejectionReason?: string;
}