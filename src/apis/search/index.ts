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

export interface SpotPreview {
    spot_id: number
    name: string
    category: string
}

export interface TripSearchDoc {
    trip_id: number
    user_id: number
    title: string
    location_summary: string
    start_date: string
    end_date: string
    created_at: string
    spot_names: string[]
    spot_categories: string[]
    spots_preview: SpotPreview[]
}

export const searchApi = {
    searchPlaces: async (keyword: string): Promise<SpotResponseDto[]> => {
        const response = await http.get<SpotResponseDto[]>('/search/place', {
            params: { keyword },
        })
        return response.data
    },

    searchTrips: async (q: string): Promise<TripSearchDoc[]> => {
        const response = await http.get<TripSearchDoc[]>('/search/trips', {
            params: { q }
        })
        return response.data
    }
}
