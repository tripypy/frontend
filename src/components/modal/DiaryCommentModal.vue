<template>
  <div
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    @click="emit('close')"
  >
    <button
      @click="emit('close')"
      class="absolute top-6 right-6 z-10 text-white hover:opacity-80 transition-opacity"
    >
      <span class="font-black text-3xl drop-shadow-[2px_2px_6px_rgba(0,0,0,0.6)]">✕</span>
    </button>

    <div
      class="bg-white border-[3px] border-[#2C2C2C] rounded-2xl shadow-[8px_8px_0px_0px_rgba(44,44,44,0.3)] max-w-6xl w-full h-[90vh] flex overflow-hidden"
      @click.stop
    >
      <div
        class="flex-1 bg-[#F5F5F5] relative border-r border-gray-200 overflow-hidden flex flex-col justify-center"
      >
        <template v-if="images && images.length > 0">
          <div
            class="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div
              v-for="(img, index) in images"
              :key="index"
              class="w-full h-full flex-shrink-0 flex items-center justify-center bg-[#F5F5F5]"
            >
              <img :src="img" :alt="title" class="w-full h-full object-contain" />
            </div>
          </div>

          <template v-if="images.length > 1">
            <button
              @click="handlePrevImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[3px] border-[#2C2C2C] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] cursor-pointer z-10"
            >
              <ChevronLeft class="w-6 h-6 text-[#2C2C2C]" stroke-width="3" />
            </button>
            <button
              @click="handleNextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[3px] border-[#2C2C2C] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] cursor-pointer z-10"
            >
              <ChevronRight class="w-6 h-6 text-[#2C2C2C]" stroke-width="3" />
            </button>

            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <div
                v-for="(_, index) in images"
                :key="index"
                :class="[
                  'w-2.5 h-2.5 rounded-full border-[2px] border-[#2C2C2C] transition-all',
                  index === currentImageIndex ? 'bg-[#2C2C2C] scale-110' : 'bg-white',
                ]"
              />
            </div>
          </template>
        </template>
        <div v-else class="flex items-center justify-center h-full text-gray-400 font-black">
          NO IMAGE
        </div>
      </div>

      <div class="w-[480px] flex flex-col bg-white">
        <div
          class="p-5 flex items-center justify-between bg-gradient-to-br from-[#FFD60A]/10 to-white"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]"
            >
              <img :src="authorAvatar" :alt="author" class="w-full h-full object-cover" />
            </div>
            <div>
              <h4 class="font-black text-[#2C2C2C] font-sans">{{ author }}</h4>
              <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
                <MapPin class="w-3 h-3" stroke-width="2.5" />
                <span>{{ location }}</span>
                <span>•</span>
                <Calendar class="w-3 h-3" stroke-width="2.5" />
                <span>{{ date }}</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <button
              @click="showDropdown = !showDropdown"
              class="p-2 hover:bg-gray-100 rounded transition-all"
            >
              <MoreHorizontal class="w-6 h-6 text-[#2C2C2C]" stroke-width="2.5" />
            </button>

            <div
              v-if="showDropdown"
              class="absolute right-0 top-full mt-2 w-40 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.2)] overflow-hidden z-20"
            >
              <button
                @click="handleShare"
                class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
              >
                <Share class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
                <span class="font-bold text-sm text-[#2C2C2C]">공유</span>
              </button>

              <template v-if="isAuthor">
                <button
                  @click="handleEdit"
                  class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left border-t border-gray-200"
                >
                  <Edit class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
                  <span class="font-bold text-sm text-[#2C2C2C]">수정</span>
                </button>

                <button
                  @click="handleDelete"
                  class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
                >
                  <Trash2 class="w-4 h-4 text-red-500" stroke-width="2.5" />
                  <span class="font-bold text-sm text-red-500">삭제</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <div class="p-5 border-b border-gray-200">
          <h3 class="font-black text-lg mb-2 text-[#2C2C2C] font-sans">{{ title }}</h3>

          <div v-if="course && course.length > 0" class="mb-3 flex items-center flex-wrap gap-1.5">
            <div v-for="(place, index) in course" :key="index" class="flex items-center gap-1.5">
              <button
                class="flex items-center gap-1 px-2.5 py-1 border-[2px] border-[#2C2C2C] rounded-full bg-white shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all course-badge"
                :style="{ '--hover-color': getBadgeColor(index) }"
                @click="selectedPlace = place"
              >
                <span class="text-xs font-black text-[#2C2C2C]">{{ place.number }}</span>
                <span class="text-xs font-black text-[#2C2C2C] whitespace-nowrap">{{
                  place.name
                }}</span>
              </button>
              <ChevronRight
                v-if="index < course.length - 1"
                class="w-3 h-3 text-gray-400 flex-shrink-0"
                stroke-width="3"
              />
            </div>
          </div>

          <p class="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
            {{ content }}
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-5 pt-3 space-y-4">
          <div v-for="comment in mockComments" :key="comment.id" class="flex items-start gap-3">
            <div
              class="w-10 h-10 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]"
            >
              <img :src="comment.avatar" :alt="comment.author" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-black text-[#2C2C2C]">{{ comment.author }}</span>
                <span class="text-xs font-bold text-gray-400">{{ comment.time }}</span>
              </div>
              <p class="text-sm font-medium text-gray-800 leading-relaxed">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 bg-white">
          <div class="p-4 flex items-center gap-2">
            <button
              @click="handleLike"
              :class="[
                'flex items-center gap-1.5 px-4 py-2.5 border-[2px] border-[#2C2C2C] rounded-full font-black text-xs transition-all uppercase',
                isLiked
                  ? 'bg-[#FF6B9D] text-white shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
                  : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px]',
              ]"
            >
              <Heart :class="['w-4 h-4', isLiked ? 'fill-current' : '']" stroke-width="2.5" />
              <span>{{ currentLikes }}</span>
            </button>

            <button
              @click="isBookmarked = !isBookmarked"
              :class="[
                'p-2.5 border-[2px] border-[#2C2C2C] rounded-full transition-all',
                isBookmarked
                  ? 'bg-[#D4A520] shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
                  : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px]',
              ]"
            >
              <Bookmark
                :class="['w-4 h-4', isBookmarked ? 'text-white fill-white' : 'text-gray-600']"
                stroke-width="2.5"
              />
            </button>
          </div>

          <div class="p-4 pt-0 flex items-center gap-2.5">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              class="flex-1 px-4 py-3 border-[2px] border-[#2C2C2C] rounded-lg text-sm font-medium bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(107,143,212,0.3)] transition-all placeholder:text-gray-400"
            />
            <button
              class="px-5 py-3 border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs bg-[#F9CA6B] text-[#2C2C2C] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase tracking-wide"
            >
              작성
            </button>
          </div>
        </div>
      </div>
    </div>

    <PlaceDetailModal v-if="selectedPlace" :place="selectedPlace" @close="selectedPlace = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue' // 👈 생명주기 훅 import
import {
  Heart,
  Bookmark,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Share,
  Edit,
  Trash2,
} from 'lucide-vue-next'
import PlaceDetailModal from './PlaceDetailModal.vue'

interface CourseItem {
  number: number
  name: string
}

const props = defineProps<{
  author: string
  authorAvatar: string
  location: string
  date: string
  title: string
  content: string
  images: string[]
  likes: number
  comments: number
  course?: CourseItem[]
}>()

const emit = defineEmits(['close'])

const currentImageIndex = ref(0)
const isLiked = ref(false)
const currentLikes = ref(props.likes)
const isBookmarked = ref(false)
const selectedPlace = ref<CourseItem | null>(null)
const showDropdown = ref(false)

// 본인 여부 확인
const isAuthor = computed(() => props.author === '김민준')

const handlePrevImage = () => {
  currentImageIndex.value =
    currentImageIndex.value > 0 ? currentImageIndex.value - 1 : props.images.length - 1
}

const handleNextImage = () => {
  currentImageIndex.value =
    currentImageIndex.value < props.images.length - 1 ? currentImageIndex.value + 1 : 0
}

const handleLike = () => {
  if (isLiked.value) currentLikes.value--
  else currentLikes.value++
  isLiked.value = !isLiked.value
}

// 드롭다운 메뉴 핸들러
const handleShare = () => {
  showDropdown.value = false
  console.log('공유하기')
  // TODO: 공유 기능 구현
}

const handleEdit = () => {
  showDropdown.value = false
  console.log('수정하기')
  // TODO: 수정 기능 구현
}

const handleDelete = () => {
  showDropdown.value = false
  if (confirm('정말 삭제하시겠습니까?')) {
    console.log('삭제하기')
    // TODO: 삭제 기능 구현
  }
}

const colors = ['#FFD60A', '#FF6B9D', '#98D8C8', '#B4E4FF', '#E88555']
const getBadgeColor = (idx: number) => colors[idx % colors.length]

// 👇 ESC 키 이벤트 핸들러
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// 드롭다운 외부 클릭 시 닫기
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

// 모달이 열릴 때 이벤트 리스너 등록, 닫힐 때 해제
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  // 모달 열릴 때 뒤에 스크롤 막고 싶으면 아래 주석 해제
  // document.body.style.overflow = 'hidden';
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  // document.body.style.overflow = '';
})

// Mock Data
const mockComments = [
  {
    id: 1,
    author: '김민준',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: '여기 진짜 좋아요! 저도 다음주에 가볼게요 ㅎㅎ',
    time: '2시간 전',
  },
  {
    id: 2,
    author: '박서연',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: '사진 너무 예쁘게 찍으셨네요! 👍',
    time: '5시간 전',
  },
  {
    id: 3,
    author: '이준호',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    content: '저도 여기 가봤는데 정말 좋더라구요~ 추천합니다!',
    time: '7시간 전',
  },
  {
    id: 4,
    author: '최수진',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: '날씨 좋은 날 가면 더 예쁠 것 같아요 ☀️',
    time: '1일 전',
  },
]
</script>

<style scoped>
.course-badge:hover {
  background-color: var(--hover-color);
}
</style>
