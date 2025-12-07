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
  url?: string
  memo?: string // 아이템 메모
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

export type TripStatus = 'DRAFT' | 'PLANNED' | 'COMPLETED'
export type TripVisibility = 'PUBLIC' | 'PRIVATE'

// 장소 정보를 나타내는 인터페이스 (API 응답용)
export interface Spot {
  id: number
  kakaoPlaceId: string
  name: string
  address: string
  category: string
  lat: number
  lng: number
  placeUrl: string
  thumbnailUrl?: string
}

// 여행 아이템 응답 DTO 인터페이스
export interface TripItemResponseDto {
  id: number // tripItemId를 id로 변경
  dayNumber: number
  orderIndex: number
  memo?: string // 메모는 선택 사항
  spot: Spot
}

// 여행 상세 응답 DTO 인터페이스
export interface TripDetailResponseDto {
  id: number // tripId를 id로 변경
  title: string
  startDate?: string // 시작일은 선택 사항
  endDate?: string // 종료일은 선택 사항
  status: TripStatus
  visibility: TripVisibility
  isOwner: boolean // 현재 사용자가 여행의 소유자인지 여부
  tripItems: TripItemResponseDto[] // 여행에 포함된 아이템 목록
}

// 여행 목록 응답 DTO 인터페이스 (상세 정보 제외)
export interface TripResponseDto {
  id: number // tripId를 id로 변경
  title: string
  startDate?: string
  endDate?: string
  status: TripStatus
  visibility: TripVisibility
  isOwner: boolean
}

// 여행 정보 수정 요청 DTO
export interface TripUpdateRequestDto {
  title: string
  startDate?: string
  endDate?: string
  status: TripStatus
  visibility: TripVisibility
}

// 동기화 요청 시 신규 아이템을 위한 spot 정보
export interface SpotAddDto {
  kakaoPlaceId: string
  name: string
  address: string
  category: string
  lat: number
  lng: number
  placeUrl: string
  thumbnailUrl?: string
}

// 동기화 요청 시 개별 아이템 DTO
export interface ItemSyncDto {
  tripItemId?: number
  spot?: SpotAddDto
  memo?: string
}

// 여행 아이템 목록 전체 동기화 요청 DTO
export interface TripItemSyncRequestDto {
  days: {
    dayNumber: number
    items: ItemSyncDto[]
  }[]
}
