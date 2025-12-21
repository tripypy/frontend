export interface AiChatHistory {
    role: 'user' | 'assistant'
    content: string
}

export interface AiChatRequestDto {
    message: string // 현재 사용자 입력 메시지
    mode: 'CHAT' | 'COURSE_CHECK' | 'RECOMMEND'
    history: AiChatHistory[]
    tripContext: any[] // 장소 목록 (SpotResponseDto 등)
}

export interface AiChatResponseDto {
    text: string // 서버 응답 필드명 수정 (response -> text)
}
