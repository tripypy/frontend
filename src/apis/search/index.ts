import http from '@/apis/http'

export interface SpotResponseDto {
    id: number
    kakaoPlaceId: string
    name: string
    address: string
    category: string
    lat: number
    lng: number
    placeUrl: string
    thumbnailUrl: string
    phone?: string
}

export const searchApi = {
    searchPlaces: async (keyword: string): Promise<SpotResponseDto[]> => {
        const response = await http.get<SpotResponseDto[]>('/search/place', {
            params: { keyword },
        })
        return response.data
    },
}
