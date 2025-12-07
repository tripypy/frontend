import apiClient from '@/services/api'
import type {
  TripDetailResponseDto,
  TripItemAddRequestDto,
  TripItemResponseDto,
} from '@/types/trip'

// API 호출 함수
/**
 * 새로운 빈 여행 계획을 생성합니다.
 * '여행 계획 시작' 시점에 호출됩니다.
 * @returns 생성된 여행의 상세 정보 (TripDetailResponseDto)
 */
export const createTrip = async (): Promise<TripDetailResponseDto> => {
  const response = await apiClient.post<TripDetailResponseDto>('/trips')
  return response.data
}

/**
 * 특정 여행 계획의 상세 정보를 조회합니다.
 * @param tripId 조회할 여행 계획의 ID
 * @returns 여행 계획의 상세 정보 (TripDetailResponseDto)
 */
export const getTripDetail = async (tripId: number): Promise<TripDetailResponseDto> => {
  const response = await apiClient.get<TripDetailResponseDto>(`/trips/${tripId}`)
  return response.data
}

/**
 * 특정 여행 계획을 삭제합니다.
 * @param tripId 삭제할 여행 계획의 ID
 */
export const deleteTrip = async (tripId: number): Promise<void> => {
  await apiClient.delete(`/trips/${tripId}`)
}

/**
 * 특정 여행 계획에 새로운 장소(아이템)를 추가합니다.
 * @param tripId 여행 계획 ID
 * @param itemData 추가할 아이템 정보
 * @returns 생성된 여행 아이템 정보
 */
export const addTripItem = async (
  tripId: number,
  itemData: TripItemAddRequestDto,
): Promise<TripItemResponseDto> => {
  const response = await apiClient.post<TripItemResponseDto>(`/trips/${tripId}/items`, itemData)
  return response.data
}
