// src/types/trip.ts

export interface Place {
  id?: number // 동기화 전에는 id가 없을 수 있음 (tripItemId)
  kakaoPlaceId: string // 장소의 고유 카카오 ID
  name: string
  address: string
  category: string
  lat: number
  lng: number
  phone?: string
  placeUrl?: string
  memo?: string // 아이템 메모
}

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

export enum TripStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  COMPLETED = 'COMPLETED',
}
export type TripVisibility = 'PUBLIC' | 'PRIVATE'

// 장소 정보를 나타내는 인터페이스 (API 응답용) - SpotResponseDto에 해당
export interface SpotResponseDto {
  id: number
  kakaoPlaceId: string
  name: string
  address?: string // nullable
  category?: string // nullable
  lat: number
  lng: number
  placeUrl?: string // nullable
  thumbnailUrl?: string // nullable
}

// 장소 정보를 나타내는 인터페이스 (API 요청용) - SpotRequestDto에 해당
export interface SpotRequestDto {
  kakaoPlaceId: string
  name: string
  address?: string // nullable
  category?: string // nullable
  lat: number
  lng: number
  placeUrl?: string // nullable
  thumbnailUrl?: string // nullable
}

// 여행 아이템 응답 DTO 인터페이스
export interface TripItemResponseDto {
  id: number
  dayNumber: number
  orderIndex: number
  memo?: string // nullable
  spot: SpotResponseDto
}

// 여행 상세 응답 DTO 인터페이스
export interface TripDetailResponseDto {
  id: number
  title: string
  startDate?: string // nullable
  endDate?: string // nullable
  status: TripStatus
  visibility: TripVisibility
  isOwner: boolean
  tripItems: TripItemResponseDto[]
}

// 여행 목록 응답 DTO 인터페이스 (TripCard에서 필요한 필드 포함)
export interface TripResponseDto {
  id: number
  title: string
  startDate?: string // nullable
  endDate?: string // nullable
  status: TripStatus
  visibility: TripVisibility
  isOwner: boolean
  spots: number // 추가됨
  tags?: string[] // 추가됨, nullable
  spotPreviews: { name: string }[] // 추가됨
  completedDate?: string // 추가됨, nullable
}

// 여행 요약 응답 DTO 인터페이스 (새로 추가됨)
export interface TripSummaryResponseDto {
  id: number
  title: string
  startDate: string
  endDate: string
  status: TripStatus
  visibility: TripVisibility
  day1Items: TripItemResponseDto[]
}

// 여행 정보 수정 요청 DTO
export interface TripUpdateRequestDto {
  title: string
  startDate?: string // nullable
  endDate?: string // nullable
  status: TripStatus
  visibility: TripVisibility
}

// 여행 아이템 목록 전체 수정 요청 DTO (TripItemSyncRequestDto -> TripItemsUpdateRequestDto)
export interface TripItemsUpdateRequestDto {
  days: TripItemsUpdateRequestDto_Day[]
}

export interface TripItemsUpdateRequestDto_Day {
  dayNumber: number
  items: TripItemsUpdateRequestDto_ItemSync[]
}

export interface TripItemsUpdateRequestDto_ItemSync {
  tripItemId?: number // nullable
  spot?: SpotRequestDto // nullable, 새로운 아이템인 경우 필수
  memo?: string // nullable
}



// 여행 계획 패널에서 사용하는 타입
export interface TripPlanItem {
  id: number // tripItemId
  day: number
  order: number
  place: Place
  memo?: string
}

// =================================================================
// TripLog (여행 기록) 관련 타입
// =================================================================

export interface TripLogLikeResponse {
  likeCount: number;
  liked: boolean;
}

export interface TripLogImage {
  imageRefKey: string
  imageUrl: string
  orderIndex: number
}

export interface TripLogCommentResponse {
  commentId: number
  authorNickname: string
  authorImageUrl: string
  content: string
  createdAt: string
}

export interface TripLogCommentRequest {
  content: string
}

export interface TripLogDetail {
  logId: number
  title: string
  content: string
  locationSummary: string
  likeCount: number
  commentCount: number
  createdAt: string
  authorNickname: string
  authorImageUrl: string
  tripId: number
  tripTitle: string
  images: TripLogImage[]
  comments: TripLogCommentResponse[]
}
