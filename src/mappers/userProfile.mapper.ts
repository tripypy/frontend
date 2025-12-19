import type { BaseUserProfileDto } from '@/apis/user/types'
import type { LogViewProfile } from '@/types/user/user.model'
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
        travelStyleSummary: data.travelStyleSummary,
        completedTrips: data.completedTripDetails,
        userPlans: data.tripOverviews.map(plan => ({
          ...plan,
          likes: 0,
          comments: 0,
        })),
        // logs를 TripDiaryResponseDto 형태로 변환
        diaries: data.logs.map(log => ({
          id: log.logId,
          title: log.title,
          thumbnailUrl: log.thumbnailUrl,
          visibility: 'PUBLIC',
          spotPreviews: [],
          tags: [],
          startDate: null,
          endDate: null,
          likes: 0,
          comments: 0,
        })),
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
