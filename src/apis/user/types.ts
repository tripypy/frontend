import type { User } from '@/types/auth/user.model'
import type {
    TripDetailResponseDto,
    TripResponseDto,
    TripItemResponseDto,
    TripDiaryResponseDto
} from '@/apis/trip/types'
import type { TripStatus } from '@/types/common'
import type { TripVisibility } from '@/types/trip/trip.model'

// 로그인 요청 DTO
export interface LoginRequestDto {
    email: string;
    password: string;
}
  
// 회원가입 요청 DTO
export interface SignupRequestDto {
    email: string;
    password: string;
    nickname: string;
}

export interface BaseUserProfileDto {
    id: number
    nickname: string
    profileImageUrl: string | null
    bio: string | null
    intro: string | null
    homeRegionId: number | null
    travelStyleSummary: string | null
    travelStyleId: number | null
    profileBannerUrl: string | null
    isProfilePublic: boolean
    friendsCount: number

    tripOverviews: UserTripOverviewDto[]
    completedTripDetails: UserCompletedTripDetailDto[]
    logs: UserLogSummaryDto[]
}
export interface UserTripOverviewDto {
    id: number
    title: string
    startDate: string
    endDate: string
    status: TripStatus
    visibility: TripVisibility
    locationSummary: string
    isOwner: boolean
    spots: number
    tags: string[]
    spotPreviews: { name: string }[]
    completedDate?: string
}

export interface UserCompletedTripDetailDto {
    id: number
    title: string
    startDate: string
    endDate: string
    status: TripStatus
    visibility: TripVisibility
    locationSummary: string
    tripItems: TripItemResponseDto[]
}

export interface UserLogSummaryDto {
    logId: number
    title: string
    thumbnailUrl: string | null
}

export interface UserProfileResponseDto
  extends BaseUserProfileDto {}

export type UserFriendsResponseDto = BaseUserProfileDto[]

export interface UserMeResponseDto
  extends BaseUserProfileDto {
  email: string
}

