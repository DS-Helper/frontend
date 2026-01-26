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
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user1',
      name: '사용자1',
    },
  },
  {
    id: '2',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user2',
      name: '사용자2',
    },
  },
  {
    id: '3',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user3',
      name: '사용자3',
    },
  },
  {
    id: '4',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user4',
      name: '사용자4',
    },
  },
  {
    id: '5',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user5',
      name: '사용자5',
    },
  },
  {
    id: '6',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user6',
      name: '사용자6',
    },
  },
  {
    id: '7',
    title: '옥포읍에 치과 잘하는 곳 추천 부탁해요',
    content: '스케일링이랑 충치 치료 같이 하려는데 과잉진료 없는 곳 찾는 중이에요. 옥포/논공 근처면 더 좋아요. ㅇㄴㅁㅁㅇㄴ20...',
    category: '수다',
    likeCount: 56,
    commentCount: 12,
    imageUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user7',
      name: '사용자7',
    },
  },
];

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
