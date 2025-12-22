<template>
  <div
    class="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-6"
    @click="emit('close')"
  >
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
      class="relative w-full max-w-4xl h-[85vh] flex flex-col"
      @click.stop
    >
      <!-- Single LOG Tab (always active) -->
      <div class="flex-shrink-0 self-end">
        <div class="flex items-center justify-end">
          <div class="flex relative top-[3px]">
            <button
              class="px-4 py-2 text-base font-black border-[4px] border-[#2C2C2C] rounded-t-lg transition-all focus:outline-none mr-2 border-b-0 bg-[#F9CA6B] translate-y-[-3px] shadow-[0_0_0_0_rgba(44,44,44,1)]"
            >
              LOG
            </button>
          </div>
        </div>
      </div>

      <!-- Log Header -->
      <div class="px-6 py-5 flex-shrink-0 rounded-t-xl z-20 border-[3px] border-[#2C2C2C] border-b-0 bg-white bg-gradient-to-br from-[#FFD60A]/10 to-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]">
            <img :src="logDetail.authorImageUrl" :alt="logDetail.authorNickname" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="font-black text-[#2C2C2C] font-sans">{{ logDetail.authorNickname }}</h4>
            <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
              <MapPin class="w-3 h-3" stroke-width="2.5" />
              <span>{{ logDetail.locationSummary }}</span>
              <span>•</span>
              <Calendar class="w-3 h-3" stroke-width="2.5" />
              <span>{{ logDetail.createdAt.substring(0, 10) }}</span>
            </div>
          </div>
        </div>

        <div class="relative" ref="dropdownContainer">
          <button @click="showDropdown = !showDropdown" class="p-2 hover:bg-gray-100 rounded transition-all">
            <MoreHorizontal class="w-6 h-6 text-[#2C2C2C]" stroke-width="2.5" />
          </button>

          <div v-if="showDropdown" class="absolute right-0 top-full mt-2 w-40 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.2)] overflow-hidden z-20">
            <button @click="handleShare" class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left">
              <Share class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
              <span class="font-bold text-sm text-[#2C2C2C]">공유</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Body Container -->
      <div 
        class="flex-1 flex overflow-hidden border-x-[3px] border-b-[3px] border-[#2C2C2C] rounded-b-xl isolate transform-gpu -mt-[2px]"
      >
      <TripLogContent
        v-if="logDetail"
        :log-detail="logDetail"
        :trip-detail="tripDetail"
        :initial-liked="isLiked"
        :show-header="false"
        layout="horizontal"
        @update-like="handleLikeUpdate"
        @place-click="handleCourseClick"
        @login-required="isLoginAlertVisible = true"
        @refresh-comments="fetchLogDetail"
        @edit="() => {}"
        @delete="() => {}"
        class="w-full h-full"
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
import { MapPin, Calendar, MoreHorizontal, Share } from 'lucide-vue-next'
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

const isLiked = ref(false)
const showDropdown = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
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

const handleCourseClick = (placeId: number) => {
  initialSelectedPlaceId.value = placeId
  isTripDetailModalVisible.value = true
}

const handleLikeUpdate = (payload: { logId: number; likeCount: number; liked: boolean }) => {
    isLiked.value = payload.liked
    emit('update', payload)
}

const handleShare = async () => {
  showDropdown.value = false
  const logUrl = `${window.location.origin}/diary/${props.logId}`
  
  try {
    await navigator.clipboard.writeText(logUrl)
    alert('링크가 복사되었습니다!')
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (showDropdown.value && dropdownContainer.value && !dropdownContainer.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

const handleDropdownKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showDropdown.value) {
    showDropdown.value = false
  }
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

const handleLoginConfirm = () => {
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleDropdownKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleDropdownKeydown)
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

