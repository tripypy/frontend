import {
  createTrip as apiCreateTrip,
  getTripDetail as apiGetTripDetail,
  deleteTrip as apiDeleteTrip,
  addTripItem as apiAddTripItem,
} from '@/apis/trip'
import type {
  TripDetailResponseDto,
  TripItemAddRequestDto,
  TripItemResponseDto,
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
 * 특정 여행 계획에 새로운 장소(아이템)를 추가하는 서비스 함수.
 * @param tripId 여행 계획 ID
 * @param itemData 추가할 아이템 정보
 * @returns 생성된 여행 아이템 정보
 */
export const addTripItem = async (
  tripId: number,
  itemData: TripItemAddRequestDto,
): Promise<TripItemResponseDto> => {
  return await apiAddTripItem(tripId, itemData)
}
