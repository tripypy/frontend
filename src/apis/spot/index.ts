import http from '@/apis/http'
import { type SpotResponseDto } from '@/apis/search'

export interface SpotRequestDto {
    kakaoPlaceId: string
    name: string
    address: string
    category: string
    lat: number
    lng: number
    placeUrl: string
    thumbnailUrl: string
}

export const spotApi = {
    getSpotByKakaoPlaceId: async (kakaoPlaceId: string): Promise<SpotResponseDto | null> => {
        try {
            const response = await http.get<SpotResponseDto>(`/spots/kakao/${kakaoPlaceId}`)
            return response.data
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null
            }
            throw error
        }
    },

    createSpot: async (data: SpotRequestDto): Promise<SpotResponseDto> => {
        const response = await http.post<SpotResponseDto>('/spots', data)
        return response.data
    },

    getHotPlaces: async (): Promise<SpotResponseDto[]> => {
        const response = await http.get<SpotResponseDto[]>('/spots/hot')
        return response.data
    },

    getSpotById: async (spotId: number): Promise<SpotResponseDto> => {
        const response = await http.get<SpotResponseDto>(`/spots/${spotId}`)
        return response.data
    }
}
