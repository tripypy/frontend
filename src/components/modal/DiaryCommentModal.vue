<template>
  <div
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-[-20px]"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-[-20px]"
    >
      <div
        v-if="showToast"
        class="fixed top-6 right-6 z-[60] bg-white border-[3px] border-[#2C2C2C] rounded-xl shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] px-5 py-3 flex items-center gap-3"
      >
        <div class="w-6 h-6 bg-[#FFD60A] border-[2px] border-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#2C2C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="font-black text-sm text-[#2C2C2C]">링크가 복사되었습니다!</span>
      </div>
    </Transition>

    <button
      @click="emit('close')"
      class="absolute top-6 right-6 z-10 text-white hover:opacity-80 transition-opacity"
    >
      <span class="font-black text-3xl drop-shadow-[2px_2px_6px_rgba(0,0,0,0.6)]">✕</span>
    </button>

    <div
      v-if="isLoading"
      class="text-white font-black text-2xl"
    >
      로딩 중...
    </div>
    <div
      v-else-if="error"
      class="text-red-500 font-black text-2xl bg-white p-8 rounded-lg"
    >
      {{ error }}
    </div>

    <div
      v-else-if="logDetail"
      class="bg-white border-[3px] border-[#2C2C2C] rounded-2xl shadow-[8px_8px_0px_0px_rgba(44,44,44,0.3)] max-w-6xl w-full h-[90vh] flex overflow-hidden"
      @click.stop
    >
      <div
        class="flex-1 bg-[#F5F5F5] relative border-r border-gray-200 overflow-hidden flex flex-col justify-center"
      >
        <template v-if="sortedImages.length > 0">
          <div
            class="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div
              v-for="img in sortedImages"
              :key="img.imageRefKey"
              class="w-full h-full flex-shrink-0 flex items-center justify-center bg-[#F5F5F5]"
            >
              <img :src="img.imageUrl" :alt="logDetail.title" class="w-full h-full object-contain" />
            </div>
          </div>

          <template v-if="sortedImages.length > 1">
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
                v-for="(_, index) in sortedImages"
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
              <img :src="logDetail.authorImageUrl" :alt="logDetail.authorNickname" class="w-full h-full object-cover" />
            </div>
            <div>
              <h4 class="font-black text-[#2C2C2C] font-sans">{{ logDetail.authorNickname }}</h4>
              <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
                <MapPin class="w-3 h-3" stroke-width="2.5" />
                <span>{{ logDetail.locationSummary }}</span>
                <span>•</span>
                <Calendar class="w-3 h-3" stroke-width="2.5" />
                <span>{{ formattedDate }}</span>
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
          <h3 class="font-black text-lg mb-2 text-[#2C2C2C] font-sans">{{ logDetail.title }}</h3>

          <div v-if="groupedCourse.length > 0" class="mb-4">
            <!-- Tabs -->
            <div class="flex items-center border-b-2 border-gray-200">
              <button
                v-for="day in groupedCourse"
                :key="day.dayNumber"
                @click.stop="activeDay = day.dayNumber"
                :class="[
                  'px-3 py-1 font-bold text-xs transition-all',
                  activeDay === day.dayNumber
                    ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]'
                    : 'text-gray-500 hover:text-gray-800',
                ]"
              >
                DAY {{ day.dayNumber }}
              </button>
            </div>

            <!-- Course Content -->
            <div class="pt-3">
              <div
                v-for="day in groupedCourse"
                :key="day.dayNumber"
                v-show="activeDay === day.dayNumber"
              >
                <div class="flex items-center flex-wrap gap-x-1.5 gap-y-2">
                  <div
                    v-for="(place, index) in day.places"
                    :key="index"
                    class="flex items-center gap-1.5"
                  >
                    <div
                      @click.stop="handleCourseClick(place.id)"
                      class="flex items-center gap-1 px-2.5 py-1 border-[2px] border-[#2C2C2C] rounded-full bg-white shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] course-badge cursor-pointer"
                      :style="{ '--hover-color': getBadgeColor(index) }"
                    >
                      <span class="text-xs font-black text-[#2C2C2C]">{{ index + 1 }}</span>
                      <span class="text-xs font-black text-[#2C2C2C] whitespace-nowrap">{{
                        place.name
                      }}</span>
                    </div>
                    <ChevronRight
                      v-if="index < day.places.length - 1"
                      class="w-3 h-3 text-gray-400 flex-shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
            {{ formattedContent }}
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-5 pt-3 space-y-4">
          <div v-for="comment in logDetail.comments" :key="comment.commentId" class="flex items-start gap-3">
            <div
              class="w-10 h-10 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]"
            >
              <img :src="comment.authorImageUrl" :alt="comment.authorNickname" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-black text-[#2C2C2C]">{{ comment.authorNickname }}</span>
                <span class="text-xs font-bold text-gray-400">{{ formatCommentDate(comment.createdAt) }}</span>
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

    <TripDetailModal
      v-if="isTripDetailModalVisible && tripDetail"
      :trip="tripDetail"
      :initial-place-id="initialSelectedPlaceId"
      @close="isTripDetailModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
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
  Link,
} from 'lucide-vue-next'
import { getTripLogDetail, getTripDetail } from '@/apis/trip'
import type { TripLogDetail, TripLogComment, TripDetailResponseDto } from '@/types/trip'
import { format, parseISO } from 'date-fns'
import TripDetailModal from './TripDetailModal.vue'

interface CourseItem {
  number: number
  name: string
}

const props = defineProps<{
  logId: number
}>()

const emit = defineEmits(['close'])

const logDetail = ref<TripLogDetail | null>(null)
const tripDetail = ref<TripDetailResponseDto | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const currentImageIndex = ref(0)
const isLiked = ref(false)
const isBookmarked = ref(false)
const showDropdown = ref(false)
const showToast = ref(false)
const isTripDetailModalVisible = ref(false)
const activeDay = ref(1)
const initialSelectedPlaceId = ref<number | null>(null)

// 데이터 로드
onMounted(async () => {
  try {
    isLoading.value = true
    logDetail.value = await getTripLogDetail(props.logId)
  } catch (e) {
    console.error('Failed to fetch trip log detail:', e)
    error.value = '데이터를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
})

watchEffect(async () => {
  if (logDetail.value?.tripId) {
    try {
      tripDetail.value = await getTripDetail(logDetail.value.tripId)
    } catch (e) {
      console.error('Failed to fetch trip detail:', e)
      // tripDetail을 못가져와도 로그 자체는 보여줘야 하므로 에러를 크게 표시하지 않음
    }
  }
})

// 본인 여부 확인 (임시 로직, 추후 실제 유저 정보와 비교해야 함)
const isAuthor = computed(() => logDetail.value?.authorNickname === '김민준')

const sortedImages = computed(() => {
  if (!logDetail.value?.images) return []
  return [...logDetail.value.images].sort((a, b) => a.orderIndex - b.orderIndex)
})

const formattedDate = computed(() => {
  if (!logDetail.value?.createdAt) return ''
  return format(parseISO(logDetail.value.createdAt), 'yyyy.MM.dd')
})

const formattedContent = computed(() => {
  if (!logDetail.value?.content) return ''
  // {{img_...}} 형식의 이미지 플레이스홀더가 포함된 줄 전체를 제거합니다.
  return logDetail.value.content.replace(/^[ \t]*{{\s*img_.*?\s*}}[ \t]*$\r?\n?/gm, '')
})

const groupedCourse = computed(() => {
  if (!tripDetail.value?.tripItems || tripDetail.value.tripItems.length === 0) {
    return []
  }
  const grouped = tripDetail.value.tripItems.reduce(
    (acc, item) => {
      const day = item.dayNumber
      if (!acc[day]) {
        acc[day] = { dayNumber: day, places: [] }
      }
      // place에 id를 포함시켜서 전달
      acc[day].places.push({ id: item.spot.id, name: item.spot.name })
      return acc
    },
    {} as Record<number, { dayNumber: number; places: { id: number; name: string }[] }>,
  )
  return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber)
})

watchEffect(() => {
  if (groupedCourse.value.length > 0) {
    activeDay.value = groupedCourse.value[0].dayNumber
  }
})

const handleCourseClick = (placeId: number) => {
  initialSelectedPlaceId.value = placeId
  isTripDetailModalVisible.value = true
}

const handlePrevImage = () => {
  if (!logDetail.value) return
  currentImageIndex.value =
    currentImageIndex.value > 0 ? currentImageIndex.value - 1 : logDetail.value.images.length - 1
}


const handleNextImage = () => {
  if (!logDetail.value) return
  currentImageIndex.value =
    currentImageIndex.value < logDetail.value.images.length - 1 ? currentImageIndex.value + 1 : 0
}

const currentLikes = ref(logDetail.value?.likeCount ?? 0)
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
    if (isTripDetailModalVisible.value) {
      isTripDetailModalVisible.value = false
    } else {
      emit('close')
    }
  }
}

// 드롭다운 외부 클릭 시 닫기
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})

const formatCommentDate = (dateString: string) => {
  // 간단한 시간 차이 계산 (실제 프로덕션에서는 date-fns/formatDistanceToNow 등을 사용)
  const date = parseISO(dateString)
  const now = new Date()
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000)
  if (diffSeconds < 60) return `${diffSeconds}초 전`
  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  return format(date, 'yyyy.MM.dd')
}
</script>

<style scoped>
.course-badge:hover {
  background-color: var(--hover-color);
}
</style>

