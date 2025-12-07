// src/types/trip.ts

export interface Place {
  id: number
  name: string
  address: string
  category: string
  lat: number
  lng: number
  phone?: string // 선택적 속성 (?)
  url?: string // 선택적 속성 (?)
}

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

export interface Trip {
  id: number
  title: string
  spots: number
  status: string
  tags?: string[]
  spotPreviews: { name: string }[]
  completedDate?: string
}

// 장소 정보를 나타내는 인터페이스 (API 응답용)
export interface Spot {
  kakaoPlaceId: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
  placeUrl: string;
  thumbnailUrl?: string; // 썸네일 URL은 선택 사항
}

// 여행 아이템 응답 DTO 인터페이스
export interface TripItemResponseDto {
  id: number; // tripItemId를 id로 변경
  dayNumber: number;
  orderIndex: number;
  memo?: string; // 메모는 선택 사항
  spot: Spot;
}

// 여행 상세 응답 DTO 인터페이스
export interface TripDetailResponseDto {
  id: number; // tripId를 id로 변경
  title: string;
  startDate?: string; // 시작일은 선택 사항
  endDate?: string; // 종료일은 선택 사항
  status: 'DRAFT' | 'PUBLIC'; // 여행 상태 (임시 또는 공개)
  isOwner: boolean; // 현재 사용자가 여행의 소유자인지 여부
  tripItems: TripItemResponseDto[]; // 여행에 포함된 아이템 목록
}

// 여행 목록 응답 DTO 인터페이스 (상세 정보 제외)
export interface TripResponseDto {
  id: number; // tripId를 id로 변경
  title: string;
  startDate?: string;
  endDate?: string;
  status: 'DRAFT' | 'PUBLIC';
  isOwner: boolean;
}
