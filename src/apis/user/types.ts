import type { User } from '@/types/auth/user.model'
import type {
    TripDetailResponseDto,
    TripResponseDto,
    TripDiaryResponseDto
} from '@/apis/trip/types'
// 로그인/회원가입 관련 API 통신용 DTO

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

export interface PublicUserProfile extends User {
    completedTrips: TripDetailResponseDto[];
    userPlans: TripResponseDto[];
    diaries: TripDiaryResponseDto[];
}
