import {
  createTrip as apiCreateTrip,
  getTripDetail as apiGetTripDetail,
  deleteTrip as apiDeleteTrip,
  syncTripItems as apiSyncTripItems,
} from '@/apis/trip'
import type {
  TripDetailResponseDto,
  TripItemResponseDto,
  TripItemSyncRequestDto,
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
