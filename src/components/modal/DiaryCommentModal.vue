<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-6"
  >
    <div class="text-white font-black text-2xl">
      로딩 중...
    </div>
  </div>
  
  <div
    v-else-if="error"
    class="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-6"
    @click="emit('close')"
  >
    <div class="text-red-500 font-black text-2xl bg-white p-8 rounded-lg">
      {{ error }}
    </div>
  </div>

  <TripDetailModal
    v-else-if="tripDetail && logDetail"
    :trip="tripDetail"
    :initial-tab="'log'"
    :log-data="logDetail"
    :initial-is-liked="isLiked"
    @close="emit('close')"
    @refresh="fetchLogDetail"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { getTripDetail } from '@/apis/trip/index'
import { getTripLogDetail } from '@/apis/trip-log/index'
import type { TripDetailResponseDto } from '@/apis/trip/types'
import type { TripLogDetail } from '@/types/trip/trip.model'
import TripDetailModal from './TripDetailModal.vue'

const props = defineProps<{
  logId: number
}>()

const emit = defineEmits(['close', 'update'])

const logDetail = ref<TripLogDetail | null>(null)
const tripDetail = ref<TripDetailResponseDto | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// 데이터 로드
const fetchLogDetail = async () => {
  try {
    if(!logDetail.value) isLoading.value = true
    
    const fetchedLogDetail = await getTripLogDetail(props.logId)
    // Ensure logId is present in the object
    logDetail.value = {
      ...fetchedLogDetail,
      logId: props.logId
    }
  } catch (e) {
    console.error('Failed to fetch trip log detail:', e)
    error.value = '데이터를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLogDetail)

watchEffect(async () => {
  if (logDetail.value?.tripId) {
    try {
      const fetchedTripDetail = await getTripDetail(logDetail.value.tripId)
      // Add logId to tripDetail so TripDetailModal can fetch the log
      tripDetail.value = {
        ...fetchedTripDetail,
        logId: props.logId
      }
    } catch (e: any) {
      // 403 error means the trip is PRIVATE and user doesn't have access
      // This is expected behavior, not an error
      if (e?.response?.status === 403) {
        console.warn('Trip is PRIVATE or access denied')
        tripDetail.value = null
      } else {
        console.error('Failed to fetch trip detail:', e)
      }
    }
  }
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

