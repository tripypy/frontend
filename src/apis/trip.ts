import apiClient from '@/services/api'
import type {
  TripDetailResponseDto,
  TripItemResponseDto,
  TripItemSyncRequestDto,
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
 * 여행 아이템 목록 전체를 동기화합니다.
 * @param tripId 동기화할 여행의 ID
 * @param syncData 날짜별 아이템 목록
 * @returns 변경이 완료된 전체 아이템 목록
 */
export const syncTripItems = async (
  tripId: number,
  syncData: TripItemSyncRequestDto,
): Promise<TripItemResponseDto[]> => {
  const response = await apiClient.put<TripItemResponseDto[]>(`/trips/${tripId}/items`, syncData)
  return response.data
}
