import { HelpDetailData } from "@/types/helpList";

// 유저별 상세 데이터를 가져오는 함수
export const getHelpDetailByUserId = (userId: string): HelpDetailData[] => {
  return helpDetailData.filter(data => data.userId === userId);
};

export const helpDetailData: HelpDetailData[] = [
  {
    id: "1",
    userId: "user1",
    applicantInfo: {
      name: "홍길동",
      contact: "010-0000-0000",
      organizationName: "한마음 노인복지관"
    },
    location: "대구시 달성군 옥포읍 00아파트 000동 000호",
    recipientInfo: {
      gender: "남자",
      count: 2
    },
    specialNotes: "집에 큰 개가 있습니다. 사람을 잘 따르지만, 처음 방문하실 때는 짖을 수 있으니 놀라지 마세요. 개는 묶여 있으니 접촉은 없습니다. 또한 할머니는 평소 걷기가 어려우시므로 천천히 이동해주시기 바랍니다. 병원에서는 휠체어를 대여할 수 있으니 참고해주세요."
  },
  {
    id: "2",
    userId: "user1",
    applicantInfo: {
      name: "김영희",
      contact: "010-1111-1111"
    },
    location: "대구시 달성군 옥포읍 00아파트 001동 001호",
    recipientInfo: {
      gender: "여자",
      count: 1
    },
    specialNotes: "집에 고양이가 있습니다. 조용한 편이니 걱정하지 마세요."
  },
  {
    id: "3",
    userId: "user1",
    applicantInfo: {
      name: "박철수",
      contact: "010-2222-2222"
    },
    location: "대구시 달성군 옥포읍 00아파트 002동 002호",
    recipientInfo: {
      gender: "남자",
      count: 3
    },
    specialNotes: "집에 애완동물은 없습니다. 깨끗하게 정리되어 있습니다.",
    rejectionReason: "헬퍼의 개인 사정으로 인해 해당 요청을 취소하게 되었습니다."
  },
  {
    id: "4",
    userId: "user1",
    applicantInfo: {
      name: "이미영",
      contact: "010-3333-3333"
    },
    location: "대구시 달성군 옥포읍 00아파트 003동 003호",
    recipientInfo: {
      gender: "여자",
      count: 2
    },
    specialNotes: "집에 작은 강아지가 있습니다. 매우 친근하고 사람을 좋아합니다."
  },
  {
    id: "5",
    userId: "user1",
    applicantInfo: {
      name: "정민수",
      contact: "010-4444-4444"
    },
    location: "대구시 달성군 옥포읍 00아파트 004동 004호",
    recipientInfo: {
      gender: "남자",
      count: 1
    },
    specialNotes: "집에 애완동물은 없습니다. 조용한 환경입니다."
  },
  {
    id: "6",
    userId: "user1",
    applicantInfo: {
      name: "최수진",
      contact: "010-5555-5555"
    },
    location: "대구시 달성군 옥포읍 00아파트 005동 005호",
    recipientInfo: {
      gender: "여자",
      count: 2
    },
    specialNotes: "집에 큰 개가 있습니다. 사람을 잘 따르지만, 처음 방문하실 때는 짖을 수 있으니 놀라지 마세요. 개는 묶여 있으니 접촉은 없습니다.",
    rejectionReason: "헬퍼의 안전을 생각하여 애완견의 위험도 때문에, 해당 요청은 취소되었습니다."
  },
  {
    id: "7",
    userId: "user1",
    applicantInfo: {
      name: "강동원",
      contact: "010-6666-6666"
    },
    location: "대구시 달성군 옥포읍 00아파트 006동 006호",
    recipientInfo: {
      gender: "남자",
      count: 1
    },
    specialNotes: "집에 애완동물은 없습니다. 깨끗하고 정돈된 환경입니다."
  },
  {
    id: "8",
    userId: "user1",
    applicantInfo: {
      name: "윤서연",
      contact: "010-7777-7777"
    },
    location: "대구시 달성군 옥포읍 00아파트 007동 007호",
    recipientInfo: {
      gender: "여자",
      count: 3
    },
    specialNotes: "집에 고양이 두 마리가 있습니다. 사람을 좋아하지만 처음에는 조금 겁이 많을 수 있습니다.",
    rejectionReason: "헬퍼의 일정 변경으로 인해 해당 요청을 취소하게 되었습니다."
  },
  {
    id: "9",
    userId: "user1",
    applicantInfo: {
      name: "임태호",
      contact: "010-8888-8888"
    },
    location: "대구시 달성군 옥포읍 00아파트 008동 008호",
    recipientInfo: {
      gender: "남자",
      count: 2
    },
    specialNotes: "집에 애완동물은 없습니다. 조용하고 평화로운 환경입니다."
  },
  {
    id: "10",
    userId: "user1",
    applicantInfo: {
      name: "한소영",
      contact: "010-9999-9999"
    },
    location: "대구시 달성군 옥포읍 00아파트 009동 009호",
    recipientInfo: {
      gender: "여자",
      count: 1
    },
    specialNotes: "집에 작은 강아지가 있습니다. 매우 친근하고 사람을 좋아합니다."
  },
  {
    id: "14",
    userId: "user1",
    applicantInfo: {
      name: "임태호",
      contact: "010-8888-8888"
    },
    location: "대구시 달성군 옥포읍 00아파트 014동 014호",
    recipientInfo: {
      gender: "남자",
      count: 2
    },
    specialNotes: "집에 애완동물은 없습니다. 조용하고 평화로운 환경입니다.",
    rejectionReason: "헬퍼의 건강상의 이유로 인해 해당 요청을 취소하게 되었습니다."
  },
  {
    id: "22",
    userId: "user1",
    applicantInfo: {
      name: "김민수",
      contact: "010-2222-3333"
    },
    location: "대구시 달성군 옥포읍 00아파트 022동 022호",
    recipientInfo: {
      gender: "남자",
      count: 1
    },
    specialNotes: "집에 애완동물은 없습니다. 깨끗하고 정돈된 환경입니다.",
    rejectionReason: "헬퍼의 개인 사정으로 인해 해당 요청을 취소하게 되었습니다."
  }
];

// ID로 상세 데이터를 찾는 헬퍼 함수
export const getHelpDetailById = (id: string): HelpDetailData | undefined => {
  return helpDetailData.find(data => data.id === id);
};
