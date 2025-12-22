<template>
  <div
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4"
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
      <!-- Left: Image Slider -->
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

      <!-- Right: Trip Log Content -->
      <div class="w-[480px] flex flex-col bg-white">
          <TripLogContent
            :log-detail="logDetail"
            :trip-detail="tripDetail"
            :initial-liked="isLiked"
            @update-like="handleLikeUpdate"
            @place-click="handleCourseClick"
            @login-required="isLoginAlertVisible = true"
            @refresh-comments="fetchLogDetail"
          />
      </div>
    </div>

    <TripDetailModal
      v-if="isTripDetailModalVisible && tripDetail"
      :trip="tripDetail"
      :initial-place-id="initialSelectedPlaceId"
      @close="isTripDetailModalVisible = false"
    />

    <AlertDialog
      :show="isLoginAlertVisible"
      title="로그인 필요"
      message="로그인 후 이용해주세요!"
      confirm-button-text="로그인"
      close-button-text="취소"
      @close="isLoginAlertVisible = false"
      @confirm="handleLoginConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getTripDetail } from '@/apis/trip/index'
import { getTripLogDetail, getTripLogLikeStatus } from '@/apis/trip-log/index'
import type { TripDetailResponseDto } from '@/apis/trip/types'
import type { TripLogDetail } from '@/types/trip/trip.model'
import TripDetailModal from './TripDetailModal.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import { useAuthStore } from '@/stores/auth'
import TripLogContent from '@/components/trip-log/TripLogContent.vue'

const props = defineProps<{
  logId: number
}>()

const emit = defineEmits(['close', 'update'])

const router = useRouter()
const authStore = useAuthStore()

const logDetail = ref<TripLogDetail | null>(null)
const tripDetail = ref<TripDetailResponseDto | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const currentImageIndex = ref(0)
const isLiked = ref(false)
const showToast = ref(false)
const isTripDetailModalVisible = ref(false)
const initialSelectedPlaceId = ref<number | null>(null)
const isLoginAlertVisible = ref(false)

// 데이터 로드
const fetchLogDetail = async () => {
  try {
    // isLoading only on first load
    if(!logDetail.value) isLoading.value = true
    
    const fetchedLogDetail = await getTripLogDetail(props.logId)
    logDetail.value = fetchedLogDetail

    if (authStore.isLoggedIn) {
      const likeStatus = await getTripLogLikeStatus(props.logId)
      isLiked.value = likeStatus.liked
    } else {
      isLiked.value = false
    }
  } catch (e) {
    console.error('Failed to fetch trip log detail or like status:', e)
    error.value = '데이터를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLogDetail)

watchEffect(async () => {
  if (logDetail.value?.tripId) {
    try {
      tripDetail.value = await getTripDetail(logDetail.value.tripId)
    } catch (e) {
      console.error('Failed to fetch trip detail:', e)
    }
  }
})

const sortedImages = computed(() => {
  if (!logDetail.value?.images) return []
  return [...logDetail.value.images].sort((a, b) => a.orderIndex - b.orderIndex)
})

const handleCourseClick = (placeId: number) => {
  initialSelectedPlaceId.value = placeId
  isTripDetailModalVisible.value = true
}

const handlePrevImage = () => {
  if (!logDetail.value) return
  currentImageIndex.value =
    currentImageIndex.value > 0 ? currentImageIndex.value - 1 : sortedImages.value.length - 1
}

const handleNextImage = () => {
  if (!logDetail.value) return
  currentImageIndex.value =
    currentImageIndex.value < sortedImages.value.length - 1 ? currentImageIndex.value + 1 : 0
}

const handleLikeUpdate = (payload: { logId: number; likeCount: number; liked: boolean }) => {
    isLiked.value = payload.liked
    emit('update', payload)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.stopPropagation() // Prevent event from bubbling to parent modals (window listener)
    if (isTripDetailModalVisible.value) {
      isTripDetailModalVisible.value = false
    } else {
      emit('close')
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.course-badge:hover {
  background-color: var(--hover-color);
}

.no-animation-enter-active,
.no-animation-leave-active {
  transition: none;
}
</style>

