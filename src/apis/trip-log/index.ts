import apiClient from '@/apis/http'
import type {
  TripLogCommentRequest,
  TripLogCommentResponse,
  TripLogLikeResponse,
  TripLogFeedResponseDto
} from '@/apis/trip-log/types'

import type { TripLogDetail } from '@/types/trip/trip.model'

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


interface GetTripLogFeedParams {
  cursor?: number | null; // optional, 첫 요청 시 null
  limit?: number;
}

/**
 * 여행 로그 피드를 조회하는 API 함수 (무한 스크롤)
 * @param params.cursor 다음 페이지를 위한 커서 값
 * @param params.limit 페이지 당 항목 수 (기본 10)
 * @returns {Promise<GetTripLogFeedResponseDto>}
 */
export async function getTripLogFeed(
  params: GetTripLogFeedParams,
): Promise<TripLogFeedResponseDto> {
  // cursor가 null이면 쿼리 파라미터에서 제외 (첫 페이지 요청)
  const cursorParam = params.cursor !== null && params.cursor !== undefined
    ? { cursor: params.cursor }
    : {};

  const response = await apiClient.get<TripLogFeedResponseDto>('/trip-logs/feed', {
    params: {
      ...cursorParam,
      limit: params.limit ?? 10,
    },
  });

  return response.data;
}

/**
 * 특정 장소가 포함된 여행 기록을 조회하는 API 함수 (무한 스크롤)
 * @param spotId 장소 ID
 * @param params.cursor 다음 페이지를 위한 커서 값
 * @param params.limit 페이지 당 항목 수 (기본 10)
 */
export async function getTripLogsBySpot(
  spotId: number,
  params: GetTripLogFeedParams
): Promise<TripLogFeedResponseDto> {
  const cursorParam = params.cursor !== null && params.cursor !== undefined
    ? { cursor: params.cursor }
    : {};

  const response = await apiClient.get<TripLogFeedResponseDto>('/trip-logs', {
    params: {
      spotId,
      ...cursorParam,
      limit: params.limit ?? 10,
    }
  });

  return response.data;
}