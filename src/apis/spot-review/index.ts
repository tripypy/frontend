import http from '@/apis/http'

export interface SpotReviewResponseDto {
    id: number
    content: string
    rating: number
    createdAt: string
    userNickname: string
    userProfileImage: string
}

export interface SpotReviewStatsResponseDto {
    averageRating: number
    reviewCount: number
}

export interface SpotReviewRequestDto {
    spotId: number
    rating: number
    content: string
}

export interface SpotReviewUpdateRequestDto {
    reviewId: number
    rating: number
    content: string
}

export const spotReviewApi = {
    getSpotReviews: async (spotId: number): Promise<SpotReviewResponseDto[]> => {
        const response = await http.get<SpotReviewResponseDto[]>(`/spot-reviews`, {
            params: { spotId },
        })
        return response.data
    },

    getSpotReviewStats: async (spotId: number): Promise<SpotReviewStatsResponseDto> => {
        const response = await http.get<SpotReviewStatsResponseDto>(`/spot-reviews/stats`, {
            params: { spotId },
        })
        return response.data
    },

    postSpotReview: async (data: SpotReviewRequestDto): Promise<void> => {
        await http.post(`/spot-reviews`, data)
    },

    updateSpotReview: async (data: SpotReviewUpdateRequestDto): Promise<void> => {
        await http.put(`/spot-reviews`, data)
    },
}
