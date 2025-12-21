import http from '@/apis/http'
import type {
    AiChatRequestDto,
    AiChatResponseDto,
    AiSpotRecommendRequestDto,
    AiSpotRecommendResponseDto,
    AiCourseCheckRequestDto
} from './types'

export const sendAiChat = async (data: AiChatRequestDto): Promise<AiChatResponseDto> => {
    const response = await http.post<AiChatResponseDto>('/ai/chat', data)
    return response.data
}

export const recommendSpot = async (data: AiSpotRecommendRequestDto): Promise<AiSpotRecommendResponseDto> => {
    const response = await http.post<AiSpotRecommendResponseDto>('/ai/recommend-spot', data)
    return response.data
}

export const checkCourse = async (data: AiCourseCheckRequestDto): Promise<AiChatResponseDto> => {
    const response = await http.post<AiChatResponseDto>('/ai/check-course', data)
    return response.data
}
