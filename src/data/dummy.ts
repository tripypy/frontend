// src/data/dummy.ts

export const initialDiaries = [
  {
    id: 1,
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    location: '서울시 성동구 성수동',
    date: '2024.11.20',
    title: '성수동 카페 투어 일기',
    content: '오늘은 성수동에서 카페 투어를 했어요!\n\n대림창고에서 시작해서 그리노 성수까지...\n(중략)\n날씨가 좋아서 사진도 예쁘게 나왔어요!',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', // 예시 이미지
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ],
    likes: 234,
    comments: 45,
    course: [
      { number: 1, name: '대림창고' },
      { number: 2, name: '그리노 성수' },
      { number: 3, name: '어반비즈서울' },
    ],
  },
  // ... 추가 데이터
];

export const initialFollowers = [
  { id: 1, name: '김서준', avatar: '', isFollowing: true },
  { id: 2, name: '이하은', avatar: '', isFollowing: false },
];
