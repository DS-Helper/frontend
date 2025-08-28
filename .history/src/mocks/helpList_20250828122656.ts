import { HelpRequest } from "@/types/helpList";

export const helpRequests: HelpRequest[] = [
    {
      id: "1",
      userId: "user1",
      date: "6.11",
      dayOfWeek: "수",
      status: "예정",
      content: "할머니가 병원에 꼭 가셔야 하는데, 평소 허리가 많이 아프셔서 혼자서는 이동이 어려우세요. 집에서 병원까지는 도보로 약 10분 거리인데, 중간에 오르막이 있어서 부축이 필요합니다. 병원 도착 후에는 진료 접수와 휠체어 대여를 도와주실 수 있으면 좋겠습니다. 진료가 끝나면 약국에도 들러야 하는데, 약 수령까지 함께 동행해주셨으면 합니다. 혹시 병원 진료 시간이 오래 걸릴 수 있으니, 너무 촉박하지 않은 일정으로 부탁드립니다. 마지막에 다시 집까지 함께 돌아와주시면 정말 감사하겠습니다.",
      startTime: "오후 2:00",
      endTime: "오후 4:00"
    },
    {
      id: "2",
      userId: "user1",
      date: "6.10",
      dayOfWeek: "화",
      status: "완료",
      content: "전등 교체 좀 해주세요",
      startTime: "오후 1:00",
      endTime: "오후 3:00"
    },
    {
      id: "3",
      userId: "user1",
      date: "6.09",
      dayOfWeek: "월",
      status: "취소",
      content: "마트에서 장을 좀 보고 싶은데, 제가 몸이 불편해서 무거운 짐을 다 들수가 없어서 그런데, 도와주세요.",
      startTime: "오후 2:00",
      endTime: "오후 4:00"
    },
    {
      id: "4",
      userId: "user1",
      date: "6.11",
      dayOfWeek: "수",
      status: "완료",
      content: "저희 할아버지와 동사무소에 같이 가주세요. 문서 작성도 조금 도와주시면 감사하겠습니다.",
      startTime: "오전 10:00",
      endTime: "오후 1:00"
    },
    {
      id: "5",
      userId: "user1",
      date: "6.11",
      dayOfWeek: "수",
      status: "완료",
      content: "저희 할아버지와 동사무소에 같이 가주세요. 문서 작성도 조금 도와주시면 감사하겠습니다.",
      startTime: "오전 10:00",
      endTime: "오후 1:00"
    },
    {
      id: "6",
      date: "6.08",
      dayOfWeek: "일",
      status: "예정",
      content: "병원 진료 동행해주세요. 약 처방전도 함께 받아오고 싶습니다.",
      startTime: "오전 9:00",
      endTime: "오전 11:00"
    },
    {
      id: "7",
      date: "6.07",
      dayOfWeek: "토",
      status: "완료",
      content: "집 청소 도와주세요. 특히 화장실과 주방을 깨끗하게 정리하고 싶어요.",
      startTime: "오후 2:00",
      endTime: "오후 5:00"
    },
    {
      id: "8",
      date: "6.06",
      dayOfWeek: "금",
      status: "취소",
      content: "은행 업무 도와주세요. 계좌 개설과 관련된 서류 작성이 필요합니다.",
      startTime: "오전 10:30",
      endTime: "오후 12:30"
    },
    {
      id: "9",
      date: "6.05",
      dayOfWeek: "목",
      status: "완료",
      content: "옷장 정리 도와주세요. 계절별로 옷을 분류하고 정리하고 싶어요.",
      startTime: "오후 1:00",
      endTime: "오후 4:00"
    },
    {
      id: "10",
      date: "6.04",
      dayOfWeek: "수",
      status: "예정",
      content: "도서관에 책 반납하고 새 책 빌리러 가주세요.",
      startTime: "오후 3:00",
      endTime: "오후 4:30"
    },
    {
      id: "11",
      date: "6.03",
      dayOfWeek: "화",
      status: "완료",
      content: "컴퓨터 문제 해결해주세요. 인터넷이 자꾸 끊어져요.",
      startTime: "오전 11:00",
      endTime: "오후 1:00"
    },
    {
      id: "12",
      date: "6.02",
      dayOfWeek: "월",
      status: "예정",
      content: "정원 가꾸기 도와주세요. 꽃과 채소를 심고 싶어요.",
      startTime: "오전 8:00",
      endTime: "오전 11:00"
    },
    {
      id: "13",
      date: "6.01",
      dayOfWeek: "일",
      status: "완료",
      content: "옷 수선 도와주세요. 바지 길이를 조금 줄이고 싶어요.",
      startTime: "오후 2:00",
      endTime: "오후 3:30"
    },
    {
      id: "14",
      date: "5.31",
      dayOfWeek: "토",
      status: "취소",
      content: "운동 동반해주세요. 공원에서 가벼운 산책을 하고 싶어요.",
      startTime: "오전 7:00",
      endTime: "오전 8:30"
    },
    {
      id: "15",
      date: "5.30",
      dayOfWeek: "금",
      status: "완료",
      content: "요리 도와주세요. 간단한 반찬 몇 가지를 만들고 싶어요.",
      startTime: "오후 4:00",
      endTime: "오후 6:00"
    },
    {
      id: "16",
      date: "5.29",
      dayOfWeek: "목",
      status: "예정",
      content: "사진 정리 도와주세요. 오래된 사진들을 앨범에 정리하고 싶어요.",
      startTime: "오후 1:00",
      endTime: "오후 4:00"
    },
    {
      id: "17",
      date: "5.28",
      dayOfWeek: "수",
      status: "완료",
      content: "전자기기 사용법 가르쳐주세요. 스마트폰 앱 사용이 어려워요.",
      startTime: "오전 10:00",
      endTime: "오전 11:30"
    },
    {
      id: "18",
      date: "5.27",
      dayOfWeek: "화",
      status: "예정",
      content: "편지 쓰기 도와주세요. 친구에게 감사 편지를 쓰고 싶어요.",
      startTime: "오후 2:00",
      endTime: "오후 3:00"
    },
    {
      id: "19",
      date: "5.26",
      dayOfWeek: "월",
      status: "완료",
      content: "창고 정리 도와주세요. 오래된 물건들을 정리하고 싶어요.",
      startTime: "오전 9:00",
      endTime: "오후 12:00"
    },
    {
      id: "20",
      date: "5.25",
      dayOfWeek: "일",
      status: "예정",
      content: "음악 감상 동반해주세요. 클래식 음악을 함께 듣고 싶어요.",
      startTime: "오후 7:00",
      endTime: "오후 8:30"
    },
    {
      id: "21",
      date: "5.24",
      dayOfWeek: "토",
      status: "완료",
      content: "독서 도와주세요. 책을 읽어주시고 내용을 설명해주세요.",
      startTime: "오후 3:00",
      endTime: "오후 5:00"
    },
    {
      id: "22",
      date: "5.23",
      dayOfWeek: "금",
      status: "취소",
      content: "게임 도와주세요. 간단한 퍼즐 게임을 함께 하고 싶어요.",
      startTime: "오후 6:00",
      endTime: "오후 7:30"
    },
    {
      id: "23",
      date: "5.22",
      dayOfWeek: "목",
      status: "완료",
      content: "명상 도와주세요. 마음을 진정시키는 방법을 가르쳐주세요.",
      startTime: "오전 6:00",
      endTime: "오전 7:00"
    },
    {
      id: "24",
      date: "5.21",
      dayOfWeek: "수",
      status: "예정",
      content: "기념일 준비 도와주세요. 가족 생일을 위한 선물을 준비하고 싶어요.",
      startTime: "오후 2:00",
      endTime: "오후 5:00"
    },
    {
      id: "25",
      date: "5.20",
      dayOfWeek: "화",
      status: "완료",
      content: "기억 정리 도와주세요. 과거의 좋은 기억들을 정리하고 싶어요.",
      startTime: "오후 1:00",
      endTime: "오후 3:00"
    }
  ];
