import apiClient from '@/services/api'
import type {
  TripDetailResponseDto,
  TripItemResponseDto,
  TripItemsUpdateRequestDto, // Changed from TripItemSyncRequestDto
  TripUpdateRequestDto,
  TripResponseDto,
  TripSummaryResponseDto, // Added
  TripStatus,
  TripLogDetail, // Added
  TripLogCommentRequest,
  TripLogCommentResponse,
  TripLogLikeResponse, // Added
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
  syncData: TripItemsUpdateRequestDto, // Changed type
): Promise<TripItemResponseDto[]> => {
  const response = await apiClient.put<TripItemResponseDto[]>(`/trips/${tripId}/items`, syncData)
  return response.data
}

/**
 * 여행의 기본 정보(제목, 날짜, 상태, 공개 여부)를 수정합니다.
 * @param tripId 수정할 여행의 ID
 * @param updateData 수정할 여행 정보
 * @returns 수정된 여행의 상세 정보 (TripDetailResponseDto)
 */
export const updateTrip = async (
  tripId: number,
  updateData: TripUpdateRequestDto,
): Promise<TripDetailResponseDto> => {
  const response = await apiClient.put<TripDetailResponseDto>(`/trips/${tripId}`, updateData)
  return response.data
}

/**
 * 내 여행 목록을 조회합니다.
 * @param status 여행 상태별 필터링 (DRAFT, PLANNED, COMPLETED)
 * @returns 내 여행 목록 (TripResponseDto 배열)
 */
export const getMyTrips = async (status?: TripStatus): Promise<TripResponseDto[]> => {
  const response = await apiClient.get<TripResponseDto[]>('/trips', {
    params: { status },
  })
  return response.data
}

/**
 * 내 여행 요약 목록을 조회합니다 (카드용).
 * @returns 내 여행 요약 목록 (TripSummaryResponseDto 배열)
 */
export const getMyTripSummaries = async (): Promise<TripSummaryResponseDto[]> => {
  const response = await apiClient.get<TripSummaryResponseDto[]>('/trips/summary')
  return response.data
}

/**
 * 여행 기록(로그) 상세 정보를 조회합니다.
 * @param logId 조회할 여행 기록의 ID
 * @returns 여행 기록 상세 정보 (TripLogDetail)
 */
export const getTripLogDetail = async (logId: number): Promise<TripLogDetail> => {
  const response = await apiClient.get<TripLogDetail>(`/trip-logs/${logId}`)
  return response.data
}

/**
 * 여행 기록(로그)에 댓글을 작성합니다.
 * @param logId 댓글을 작성할 여행 기록의 ID
 * @param commentData 댓글 내용
 * @returns 생성된 댓글 정보
 */
export const postTripLogComment = async (
  logId: number,
  commentData: TripLogCommentRequest,
): Promise<TripLogCommentResponse> => {
  const response = await apiClient.post<TripLogCommentResponse>(
    `/trip-logs/${logId}/comments`,
    commentData,
  )
  return response.data
}

/**
 * 특정 여행 기록에 좋아요를 추가합니다.
 * @param logId 좋아요를 누를 여행 기록의 ID
 * @returns 업데이트된 좋아요 수 및 좋아요 상태 (TripLogLikeResponse)
 */
export const likeTripLog = async (logId: number): Promise<TripLogLikeResponse> => {
  const response = await apiClient.post<TripLogLikeResponse>(`/trip-logs/${logId}/likes`)
  return response.data
}

/**
 * 특정 여행 기록의 좋아요를 취소합니다.
 * @param logId 좋아요를 취소할 여행 기록의 ID
 * @returns 업데이트된 좋아요 수 및 좋아요 상태 (TripLogLikeResponse)
 */
export const unlikeTripLog = async (logId: number): Promise<TripLogLikeResponse> => {
  const response = await apiClient.delete<TripLogLikeResponse>(`/trip-logs/${logId}/likes`)
  return response.data
}

/**
 * 현재 사용자가 특정 여행 기록에 좋아요를 눌렀는지 여부와 총 좋아요 수를 조회합니다.
 * @param logId 좋아요 상태를 조회할 여행 기록의 ID
 * @returns 좋아요 상태 정보 (TripLogLikeResponse)
 */
export const getTripLogLikeStatus = async (logId: number): Promise<TripLogLikeResponse> => {
  const response = await apiClient.get<TripLogLikeResponse>(`/trip-logs/${logId}/likes/status`)
  return response.data
}

