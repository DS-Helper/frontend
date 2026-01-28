// 게시판 카테고리 타입
export type BoardCategory = 
  | '수다' 
  | '맛집' 
  | '카페' 
  | '행사' 
  | '모임' 
  | '취미' 
  | '운동' 
  | '육아' 
  | '병원' 
  | '생활' 
  | '나눔' 
  | '알바' 
  | '기타';

// 게시글 타입
export interface BoardPost {
  id: string;
  title: string;
  content: string;
  category: BoardCategory;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}

// Mock 데이터
export const mockBoardPosts: BoardPost[] = [
  {
    id: '1',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: { id: 'user1', name: '신인호' },
  },
  {
    id: '2',
    title: '논공동 근처 맛있는 한정식 집 있을까요?',
    content: '부모님 모시고 가려고 하는데 분위기 좋고 음식 깔끔한 한정식집 추천받아요. 가격대는 1인 3만원 전후...',
    category: '맛집',
    likeCount: 23,
    commentCount: 8,
    imageUrl: undefined,
    createdAt: '2024-01-14T09:20:00Z',
    author: { id: 'user2', name: '김민지' },
  },
  {
    id: '3',
    title: '다들 요즘 어떤 운동하세요?',
    content: '요즘 날씨 좋아서 산책이나 가벼운 운동하려는데 달성에서 운동하기 좋은 코스나 장소 알려주세요...',
    category: '운동',
    likeCount: 41,
    commentCount: 15,
    imageUrl: undefined,
    createdAt: '2024-01-13T14:00:00Z',
    author: { id: 'user3', name: '박준형' },
  },
  {
    id: '4',
    title: '아이랑 가기 좋은 카페 있어요?',
    content: '24개월 아기 데리고 카페 가보려는데 키즈존 있거나 유아동반하기 편한 곳 알려주시면 감사해요...',
    category: '카페',
    likeCount: 32,
    commentCount: 6,
    imageUrl: undefined,
    createdAt: '2024-01-12T11:15:00Z',
    author: { id: 'user4', name: '이수진' },
  },
  {
    id: '5',
    title: '옥포에서 이사 왔는데 이웃 분들께 인사드려요',
    content: '지난주에 이사 왔어요. 앞으로 잘 부탁드립니다! 어디가 편한지 조금씩 알아가는 중이에요...',
    category: '수다',
    likeCount: 89,
    commentCount: 22,
    imageUrl: undefined,
    createdAt: '2024-01-11T08:45:00Z',
    author: { id: 'user5', name: '최동훈' },
  },
  {
    id: '6',
    title: '중고 유모차 나눔해요 (논공)',
    content: '사용 잘 하고 넘겨드립니다. 상태 괜찮아요. 직접 찾아가서 가져가시면 됩니다...',
    category: '나눔',
    likeCount: 67,
    commentCount: 11,
    imageUrl: undefined,
    createdAt: '2024-01-10T16:30:00Z',
    author: { id: 'user6', name: '정해은' },
  },
  {
    id: '7',
    title: '달성에서 볼링 치실 분 계세요?',
    content: '주말에 볼링 같이 하실 분 모집해요. 실력 상관없이 즐겁게 하는 분 찾습니다...',
    category: '모임',
    likeCount: 18,
    commentCount: 5,
    imageUrl: undefined,
    createdAt: '2024-01-09T19:00:00Z',
    author: { id: 'user7', name: '한지민' },
  },
];

// 게시글 상세 타입
export interface BoardPostDetail extends BoardPost {
  viewCount: number;
  contentFull: string; // 상세용 전체 본문
}

// 댓글 타입
export interface BoardComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: string; // ISO 또는 상대시간 표시용
  parentId?: string; // 대댓글인 경우 부모 댓글 id
}

// 상세용 전체 본문 (id별로 다름)
const detailContentByPostId: Record<string, string> = {
  "1": "스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요.",
  "2": "부모님 모시고 가려고 하는데 분위기 좋고 음식 깔끔한 한정식집 추천받아요. 가격대는 1인 3만원 전후로요. 주차 가능한 곳이면 더 좋겠어요.",
  "3": "요즘 날씨 좋아서 산책이나 가벼운 운동하려는데 달성에서 운동하기 좋은 코스나 장소 알려주세요. 실내든 야외든 괜찮아요.",
  "4": "24개월 아기 데리고 카페 가보려는데 키즈존 있거나 유아동반하기 편한 곳 알려주시면 감사해요. 주차 여유 있는 곳이면 좋겠어요.",
  "5": "지난주에 이사 왔어요. 앞으로 잘 부탁드립니다! 어디가 편한지 조금씩 알아가는 중이에요. 좋은 정보 있으면 나눠주세요.",
  "6": "사용 잘 하고 넘겨드립니다. 상태 괜찮아요. 직접 찾아가서 가져가시면 됩니다. 논공 읍내 쪽이에요.",
  "7": "주말에 볼링 같이 하실 분 모집해요. 실력 상관없이 즐겁게 하는 분 찾습니다. 2~3명이면 좋겠어요.",
};

// 상세 mock (id로 조회용)
export const getBoardPostDetail = (id: string): BoardPostDetail | null => {
  const post = mockBoardPosts.find((p) => p.id === id);
  if (!post) return null;
  const viewCounts: Record<string, number> = {
    "1": 385, "2": 142, "3": 218, "4": 96, "5": 512, "6": 203, "7": 67,
  };
  return {
    ...post,
    viewCount: viewCounts[id] ?? 100,
    contentFull: detailContentByPostId[id] ?? post.content,
  };
};

// 댓글 mock (게시글별로 다름)
export const mockBoardComments: BoardComment[] = [
  // 게시글 1 (치과)
  { id: "c1", postId: "1", author: { id: "u2", name: "김민지" }, content: "옥포면 이튼튼치과 괜찮았어요. 과잉진료 없이 설명 깔끔하게 해주더라구요. 스케일링만 받고 왔는데 부담 없었어요.", createdAt: "12분 전" },
  { id: "c2", postId: "1", author: { id: "u1", name: "신인호" }, content: "좋은 정보 감사합니다~", createdAt: "12분 전", parentId: "c1" },
  { id: "c3", postId: "1", author: { id: "u3", name: "박준형" }, content: "옥포에 치과가 있나요?", createdAt: "16분 전" },
  { id: "c4", postId: "1", author: { id: "u4", name: "이수진" }, content: "리더스 추천할게요~", createdAt: "18분 전", parentId: "c3" },
  { id: "c5", postId: "1", author: { id: "u5", name: "최동훈" }, content: "저도 한동안 찾다가 논공 쪽 다녔어요.", createdAt: "18분 전" },
  // 게시글 2 (한정식)
  { id: "c6", postId: "2", author: { id: "u1", name: "신인호" }, content: "논공에 청담 한정식 괜찮더라구요. 분위기도 좋고요.", createdAt: "1시간 전" },
  { id: "c7", postId: "2", author: { id: "u6", name: "정해은" }, content: "저희 부모님도 거기 좋아하시더라고요!", createdAt: "45분 전", parentId: "c6" },
  // 게시글 3 (운동)
  { id: "c8", postId: "3", author: { id: "u4", name: "이수진" }, content: "달성호 산책로 좋아요. 한 바퀴 도는 것만 해도 운동 됩니다.", createdAt: "2시간 전" },
  { id: "c9", postId: "3", author: { id: "u7", name: "한지민" }, content: "저도 자주 가요! 주말에는 사람 좀 많아요.", createdAt: "1시간 전", parentId: "c8" },
  // 게시글 4 (카페)
  { id: "c10", postId: "4", author: { id: "u2", name: "김민지" }, content: "논공에 플로레스 카페 키즈존 있어요. 넓고 좋아요.", createdAt: "3시간 전" },
  // 게시글 5 (인사)
  { id: "c11", postId: "5", author: { id: "u1", name: "신인호" }, content: "환영합니다! 저도 얼마 전에 이사 왔어요.", createdAt: "5시간 전" },
  { id: "c12", postId: "5", author: { id: "u3", name: "박준형" }, content: "많이 와주세요~", createdAt: "4시간 전", parentId: "c11" },
  // 게시글 6 (나눔)
  { id: "c13", postId: "6", author: { id: "u5", name: "최동훈" }, content: "혹시 아직 나눔 가능할까요? 연락드려도 될까요.", createdAt: "어제" },
  // 게시글 7 (볼링)
  { id: "c14", postId: "7", author: { id: "u2", name: "김민지" }, content: "저 관심 있어요! 주말 몇 시쯤 생각하세요?", createdAt: "6시간 전" },
];

export const getBoardComments = (postId: string): BoardComment[] =>
  mockBoardComments.filter((c) => c.postId === postId);

// 카테고리 목록
export const boardCategories: BoardCategory[] = [
  '수다',
  '맛집',
  '카페',
  '행사',
  '모임',
  '취미',
  '운동',
  '육아',
  '병원',
  '생활',
  '나눔',
  '알바',
  '기타',
];
