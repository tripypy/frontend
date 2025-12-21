export interface ChatMessageDto {
    role: 'user' | 'assistant'
    content: string
}

export interface AiChatSpotDto {
    name: string
    category: string
    address: string
}

export interface AiChatRequestDto {
    message: string
    history: ChatMessageDto[]
    tripContext: AiChatSpotDto[]
}

export interface AiChatResponseDto {
    text: string
}
