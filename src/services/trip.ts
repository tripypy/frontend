import {
  createTrip as apiCreateTrip,
  getTripDetail as apiGetTripDetail,
  deleteTrip as apiDeleteTrip,
  syncTripItems as apiSyncTripItems,
  updateTrip as apiUpdateTrip,
} from '@/apis/trip'
import type {
  TripDetailResponseDto,
  TripItemResponseDto,
  TripItemSyncRequestDto,
  TripUpdateRequestDto,
} from '@/types/trip'

/**
 * 새로운 여행 계획을 생성하는 서비스 함수.
 * API 계층의 createTrip 함수를 호출하고 결과를 반환합니다.
 * @returns 생성된 여행의 상세 정보 (TripDetailResponseDto)
 */
export const createTrip = async (): Promise<TripDetailResponseDto> => {
  return await apiCreateTrip()
}

/**
 * 특정 여행 계획의 상세 정보를 조회하는 서비스 함수.
 * API 계층의 getTripDetail 함수를 호출하고 결과를 반환합니다.
 * @param tripId 조회할 여행 계획의 ID
 * @returns 여행 계획의 상세 정보 (TripDetailResponseDto)
 */
export const getTripDetail = async (tripId: number): Promise<TripDetailResponseDto> => {
  return await apiGetTripDetail(tripId)
}

/**
 * 특정 여행 계획을 삭제하는 서비스 함수.
 * @param tripId 삭제할 여행 계획의 ID
 */
export const deleteTrip = async (tripId: number): Promise<void> => {
  await apiDeleteTrip(tripId)
}

/**
 * 여행 아이템 목록 전체를 동기화하는 서비스 함수.
 * @param tripId 동기화할 여행의 ID
 * @param syncData 날짜별 아이템 목록
 * @returns 변경이 완료된 전체 아이템 목록
 */
export const syncTripItems = async (
  tripId: number,
  syncData: TripItemSyncRequestDto,
): Promise<TripItemResponseDto[]> => {
  return await apiSyncTripItems(tripId, syncData)
}

/**
 * 여행의 기본 정보(제목, 날짜, 상태, 공개 여부)를 수정하는 서비스 함수.
 * @param tripId 수정할 여행의 ID
 * @param updateData 수정할 여행 정보
 * @returns 수정된 여행의 상세 정보 (TripDetailResponseDto)
 */
export const updateTrip = async (
  tripId: number,
  updateData: TripUpdateRequestDto,
): Promise<TripDetailResponseDto> => {
  return await apiUpdateTrip(tripId, updateData)
}
