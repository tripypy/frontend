<template>
  <div 
    ref="containerRef"
    class="fixed z-50 font-sans transition-opacity duration-200"
    :class="{ 'pointer-events-none': !isOpen && !isDragging, 'cursor-move': isDragging }"
    :style="containerStyle"
  >
    <!-- Floating Button (Anchor) -->
    <button
      @mousedown="startDrag"
      @click="toggleChat"
      class="group relative w-14 h-14 pointer-events-auto cursor-grab active:cursor-grabbing"
      :class="{ 'scale-95': isDragging }"
    > 
      <div class="absolute inset-0 bg-[#2C2C2C] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300"></div>
      
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <MessageCircle 
          v-if="!isOpen" 
          class="w-7 h-7 group-hover:scale-110 transition-transform duration-300" 
          stroke-width="2"
        />
        <X 
          v-else 
          class="w-7 h-7" 
          stroke-width="2"
        />
      </div>
    </button>

    <!-- Chat Window (Absolute Positioned Upwards) -->
    <transition
      enter-active-class="transition-all duration-300 ease-out origin-bottom-right"
      enter-from-class="opacity-0 scale-90 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in origin-bottom-right"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-90 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-20 right-0 w-[420px] h-[650px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden pointer-events-auto border border-gray-100"
      >
        <!-- Header -->
        <div 
          @mousedown="startDrag"
          class="bg-[#2C2C2C] p-4 flex justify-between items-center text-white cursor-grab active:cursor-grabbing"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-sm tracking-wide">Trip AI Assistant</span>
              <span class="text-[10px] text-gray-300">Always here to help</span>
            </div>
          </div>
          <button 
            @click.stop="isOpen = false" 
            class="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-white space-y-4 custom-scrollbar">
          <div v-for="(msg, index) in messages" :key="index" :class="[
            'flex',
            msg.isUser ? 'justify-end' : 'justify-start'
          ]">
            <!-- Message Bubble -->
            <div 
              :class="[
                'max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm',
                msg.isUser 
                  ? 'bg-[#9BCCC4] text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-[#F5F5F5] text-[#2C2C2C] rounded-2xl rounded-tl-sm',
                (msg as any).relatedSpot ? 'cursor-pointer hover:brightness-95 active:scale-95 transition-all' : ''
              ]"
              v-html="formatMessage(msg.text)"
              @click="(msg as any).relatedSpot && props.highlightCandidate && props.highlightCandidate((msg as any).relatedSpot)"
            >
            </div>
            
            <!-- Map Link Indicator -->
            <div v-if="(msg as any).relatedSpot" class="text-[10px] text-gray-400 mt-1 ml-1 flex items-center gap-1">
               <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">지도에서 위치 보기 📍</span>
            </div>

          </div>

          <!-- Loading (Typing) Indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-[#F5F5F5] text-[#2C2C2C] rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1 w-16 h-[46px]">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <!-- Quick Actions (Menu) -->
        <div class="px-4 py-2 bg-white flex justify-center gap-2 border-t border-gray-100">
           <button 
            @click="handleRecommend"
            class="px-3 py-1.5 rounded-full bg-white border border-[#9BCCC4] text-[#9BCCC4] text-xs font-semibold hover:bg-[#9BCCC4] hover:text-white transition-colors flex items-center gap-1 shadow-sm"
            :disabled="isLoading"
          >
            ✨ 장소 추천
          </button>
          <button 
            @click="handleCheckCourse"
            class="px-3 py-1.5 rounded-full bg-white border border-[#2C2C2C] text-[#2C2C2C] text-xs font-semibold hover:bg-[#2C2C2C] hover:text-white transition-colors flex items-center gap-1 shadow-sm"
            :disabled="isLoading"
          >
            ✅ 코스 점검
          </button>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-100">
          <div class="relative flex items-center gap-2">
            <input
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Ask anything about your trip..."
              class="w-full pl-5 pr-12 py-3.5 bg-[#F8F9FA] border border-transparent rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#9BCCC4] focus:ring-2 focus:ring-[#9BCCC4]/20 transition-all shadow-inner"
            />
            <button 
              @click="sendMessage"
              class="absolute right-2 p-2 bg-[#2C2C2C] text-white rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              :disabled="!inputMessage.trim()"
            >
              <Send class="w-4 h-4 ml-0.5" stroke-width="2.5" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { MessageCircle, X, Send, Bot } from 'lucide-vue-next'
import { sendAiChat } from '@/apis/ai'
import type { ChatMessageDto, RecommendSpotDto } from '@/apis/ai/types'
import { useTripPlan } from '@/composables/trip/useTripPlan'

const props = defineProps<{
  fetchCandidates?: () => Promise<RecommendSpotDto[]>
  highlightCandidate?: (candidate: any) => void
}>()

const isOpen = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messages = ref<({ 
  text: string; 
  isUser: boolean; 
  relatedSpot?: any 
} | { isTyping: boolean; isUser: false })[]>([
  { text: '안녕! 여행 계획 도와줄까?', isUser: false }
])

// Trip Context
const { allSelectedPlaces, tripTitle, formattedDate } = useTripPlan()

// Dragging Logic
const containerRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
let isDragGesture = false 

onMounted(() => {
  if (typeof window !== 'undefined') {
    position.value = {
      x: window.innerWidth - 80, 
      y: window.innerHeight - 80
    }
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
})

const handleResize = () => {
  // Keep position safe? 
}

const containerStyle = computed(() => {
  return {
     left: `${position.value.x}px`,
     top: `${position.value.y}px`
  }
})

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  isDragGesture = false
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  isDragGesture = true
  
  let newX = e.clientX - dragOffset.value.x
  let newY = e.clientY - dragOffset.value.y
  
  const maxX = window.innerWidth - 60
  const maxY = window.innerHeight - 60
  
  newX = Math.max(10, Math.min(newX, maxX))
  newY = Math.max(10, Math.min(newY, maxY))
  
  position.value = { x: newX, y: newY }
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

const toggleChat = () => {
  if (isDragGesture) return
  isOpen.value = !isOpen.value
  isDragGesture = false
}

// *** API Integration ***
// --- Prompt Builders ---

// 1. System Prompt (기본 성격 + 응답 규칙)
const getSystemPrompt = (): ChatMessageDto => ({
  role: 'system',
  content: `
당신은 여행 전문가 AI 'TRIT'입니다. 사용자에게 친절하고 유익한 여행 정보를 제공합니다.
한국어로 대답하세요. 반말을 사용해 친근하게 대화하세요.
`
})

// 2. Trip Context (현재 여행 정보)
const getTripContext = (): ChatMessageDto => {
  const tripInfo = `
여행 제목: ${tripTitle.value || '제목 없음'}
여행 날짜: ${formattedDate.value}
현재 일정:
${(allSelectedPlaces.value || []).map((p, i) => `${i + 1}. ${p.name} (${p.category}) - ${p.address}`).join('\n')}
`
  return {
    role: 'user', // 문맥을 유저 메시지로 주입 (또는 system에 포함 가능)
    content: `현재 나의 여행 계획이야:\n${tripInfo}`
  }
}

// --- Handlers ---

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userText = inputMessage.value
  messages.value.push({ text: userText, isUser: true })
  inputMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    // Build Chat History
    // (Actual implementation should manage history size/tokens, simplifed here)
    const history: ChatMessageDto[] = messages.value
      .filter(m => m.text && !('isTyping' in m)) // Filter out UI typing
      .map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }))

    // Construct Payload
    const payload = {
      messages: [
        getSystemPrompt(),
        getTripContext(),
        ...history.slice(-10), // 최근 10개 대화만 유지
      ]
    }

    const response = await sendAiChat(payload)
    messages.value.push({ text: response.text, isUser: false })

  } catch (error) {
    console.error('Chat Error:', error)
    messages.value.push({ text: '오류가 발생했어. 잠시 후 다시 시도해줄래?', isUser: false })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const formatMessage = (text: string) => {
  if (!text) return ''
  // 1. Newlines to <br>
  let formatted = text.replace(/\n/g, '<br>')
  
  // 2. **Bold** to <b>Bold</b>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
  
  return formatted
}

const handleRecommend = async () => {
  if (isLoading.value) return
  if (!props.fetchCandidates) {
    messages.value.push({ text: '지도 정보를 불러올 수 없어 ㅠㅠ', isUser: false })
    return
  }

  messages.value.push({ text: '어떤 장소를 추가하면 좋을까?', isUser: true })
  isLoading.value = true
  scrollToBottom()

  try {
    const candidates = await props.fetchCandidates()
    
    if (candidates.length === 0) {
       messages.value.push({ text: '주변에 추천할 만한 곳이 없네. 지도를 조금 이동해볼래?', isUser: false })
       isLoading.value = false
       return
    }

    // Recommendation Prompt
    const prompt = `
나의 현재 여행 일정과 스타일을 고려해서, 아래 후보 장소 목록 중 **가장 잘 어울리는 장소 1곳**을 추천해줘.
이유는 3줄 이내로, 사용자가 꼭 가보고 싶게 매력적으로(반말, 친근하게) 작성해줘.
응답은 반드시 아래 **JSON 형식**으로만 해줘. 다른 설명은 붙이지 마.

후보 장소 목록:
${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, category: c.category })))}

[JSON 응답 형식]
{
  "recommendation": {
    "spotId": "후보 장소의 id (그대로 반환)",
    "name": "장소명",
    "reason": "추천 이유 (매력적인 설명)"
  }
}
`
    const payload = {
      messages: [
        getSystemPrompt(),
        getTripContext(),
        { role: 'user', content: prompt }
      ]
    }

    const response = await sendAiChat(payload as any)
    
    // Parse JSON
    let content = response.text
    // Remove markdown code blocks if present
    content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    
    try {
        const parsed = JSON.parse(content)
        const rec = parsed.recommendation
        
        const aiText = `✨ **${rec.name}** 어때?\n\n${rec.reason}`
        
        // Find candidate object for map linking
        const matchedCandidate = candidates.find(c => String(c.id) === String(rec.spotId)) || 
                                 candidates.find(c => c.name === rec.name)

        messages.value.push({
            text: aiText,
            isUser: false,
            relatedSpot: matchedCandidate
        })
        
        if (matchedCandidate && props.highlightCandidate) {
            props.highlightCandidate(matchedCandidate)
        }

    } catch (e) {
        console.error('JSON Parse Error', e)
        // Fallback: show raw text if parsing fails
        messages.value.push({ text: response.text, isUser: false })
    }

  } catch (error) {
    console.error('Recommend Error:', error)
    messages.value.push({ text: '추천을 받아오는 중 오류가 발생했어.', isUser: false })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const handleCheckCourse = async () => {
  if (isLoading.value) return
  
  if (!allSelectedPlaces.value || allSelectedPlaces.value.length === 0) {
     messages.value.push({ text: '먼저 여행 장소를 담아줘!', isUser: false })
     return
  }

  messages.value.push({ text: '현재 코스 좀 점검해줄래?', isUser: true })
  isLoading.value = true
  scrollToBottom()
  
  try {
    const prompt = `
현재 나의 여행 코스를 전문가 시각에서 진단해줘. 아래 항목들을 포함해서 친근하게(반말) 조언해줘.

1. **🚩 동선 효율성**: 이동 경로가 합리적인지 봐줘.
2. **⚖️ 밸런스**: 식사, 관광, 휴식(카페) 배분이 적절한지 분석해줘.
3. **💡 개선 팁**: 너무 빡빡하진 않은지, 더 추가하면 좋을 테마가 있는지 제안해줘.
`
    const payload = {
       messages: [
         getSystemPrompt(),
         getTripContext(),
         { role: 'user', content: prompt }
       ]
    }

    const response = await sendAiChat(payload as any)
    messages.value.push({ text: response.text, isUser: false })

  } catch (error) {
    console.error('Check Course Error:', error)
     messages.value.push({ text: '코스 점검 중 오류가 발생했어.', isUser: false })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const chatArea = containerRef.value?.querySelector('.custom-scrollbar')
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight
    }
  })
}
</script>

<style scoped>
.font-sans {
  font-family: 'Outfit', sans-serif;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
