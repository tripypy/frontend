import type { BaseUserProfileDto } from '@/apis/user/types'
import type { LogViewProfile } from '@/types/trip/trip.model'
import type { TripDiaryResponseDto } from '@/apis/trip/types' // 추가 필요
import type { UserLogSummaryDto } from '@/apis/user/types';

export function toLogViewProfile(
    data: BaseUserProfileDto,
    isMyProfile: boolean,
    email?: string
    ): LogViewProfile {
    return {
        id: data.id,
        nickname: data.nickname,
        profileImageUrl: data.profileImageUrl,
        bio: data.bio,
        intro: data.intro,
        friendsCount: data.friendsCount,
        isMyProfile,
        email,
        completedTrips: data.completedTripDetails,
        userPlans: data.tripOverviews,
        // logs를 TripDiaryResponseDto 형태로 변환
        diaries: data.logs.map(log => ({
            id: log.logId,            // logId -> id 매핑
            title: log.title,
            thumbnailUrl: log.thumbnailUrl,
            // 아래는 UI 렌더링을 위한 기본값 설정
            visibility: 'PUBLIC',     // 기본값
            spotPreviews: [],         // 방문지 정보 없음
            tags: [],                 // 태그 정보 없음
            startDate: null,          // 날짜 정보 없음
            endDate: null,            // 날짜 정보 없음
            likes: 0,                 // 좋아요 정보 없음
            comments: 0,              // 댓글 정보 없음
        } as TripDiaryResponseDto)), // 강제 형변환 혹은 타입 호환 확인
    }
}

export function normalizeDiary(diary: TripDiaryResponseDto | UserLogSummaryDto): TripDiaryResponseDto {
    // UserLogSummaryDto인 경우 (logId가 존재)
    if ('logId' in diary) {
        return {
            id: diary.logId,
            title: diary.title,
            thumbnailUrl: diary.thumbnailUrl,
            // 기본값 설정
            visibility: 'PUBLIC',
            spotPreviews: [],
            tags: [],
            startDate: null,
            endDate: null,
            likes: 0,
            comments: 0
        };
    }
    // 이미 TripDiaryResponseDto인 경우
    return diary;
}
