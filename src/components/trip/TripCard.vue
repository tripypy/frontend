<template>
  <div
    class="bg-white border-[3px] border-[#2C2C2C] rounded-xl overflow-hidden cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(44,44,44,1)] shadow-[4px_4px_0px_0px_rgba(44,44,44,1)]"
    @click="emit('openModal', trip.id)"
  >
    <div class="p-5 border-b-[3px] border-[#2C2C2C]" :style="{ backgroundColor: headerColor }">
      <div class="flex items-center justify-between mb-3 h-6">
        <div class="flex items-center gap-1.5 text-xs text-[#2C2C2C] font-bold">
          <Calendar class="w-3.5 h-3.5" stroke-width="2.5" />
          <span>{{ displayDateRange }}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click.stop="handleShare"
            class="w-7 h-7 bg-white border-[2px] border-[#2C2C2C] rounded-md hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all focus:outline-none"
          >
            <Share2 class="w-3.5 h-3.5" stroke-width="2.5" />
          </button>

          <button
            @click.stop="isBookmarked = !isBookmarked"
            :class="[
              'w-7 h-7 border-[2px] border-[#2C2C2C] rounded-md hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all focus:outline-none',
              isBookmarked ? 'bg-[#2C2C2C]' : 'bg-white',
            ]"
          >
            <Bookmark
              class="w-3.5 h-3.5"
              stroke-width="2.5"
              :class="isBookmarked ? 'text-white fill-white' : 'text-[#2C2C2C]'"
            />
          </button>
        </div>
      </div>

      <h3 class="font-black text-2xl tracking-tight leading-tight text-[#2C2C2C] font-sans">
        {{ trip.title }}
      </h3>
    </div>

    <div class="p-5 bg-white">
      <div class="mb-5 h-[32px] flex items-center overflow-hidden">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
          <template v-if="trip.tags && trip.tags.length > 0">
            <span
              v-for="(tag, index) in trip.tags"
              :key="index"
              class="px-2.5 py-1 bg-white rounded-full text-[11px] font-black border-[2px] border-[#2C2C2C] whitespace-nowrap flex-shrink-0"
            >
              #{{ tag }}
            </span>
            <button
              @click.stop
              class="w-7 h-7 rounded-full bg-white border-[2px] border-[#2C2C2C] flex items-center justify-center flex-shrink-0 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <span class="text-[#2C2C2C] font-black text-sm">+</span>
            </button>
          </template>
          <button
            v-else
            @click.stop
            class="px-3 py-1 bg-white rounded-full text-[11px] font-black border-[2px] border-[#2C2C2C] border-dashed whitespace-nowrap hover:bg-gray-50 transition-colors flex items-center gap-1.5 focus:outline-none"
          >
            <span class="text-sm">+</span>
            <span>태그 추가</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-3">
        <MapPin class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
        <span class="text-xs font-black text-[#2C2C2C]">코스 {{ trip.spots }}개</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="(spot, index) in trip.spotPreviews"
          :key="index"
          class="flex items-center gap-3 py-1"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border-[2.5px] border-[#2C2C2C]"
            :style="{ backgroundColor: getNumberColor(index) }"
          >
            {{ index + 1 }}
          </div>
          <span class="text-sm font-bold text-[#2C2C2C] truncate">{{ spot.name }}</span>
        </div>
      </div>

      <div v-if="trip.spots > trip.spotPreviews.length" class="mt-4 text-center">
        <button class="text-xs font-black text-[#2C2C2C] hover:underline focus:outline-none">
          +{{ trip.spots - trip.spotPreviews.length }}개 더보기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, Share2, Bookmark, MapPin } from 'lucide-vue-next'
import { TripResponseDto, TripStatus } from '@/types/trip' // Import TripResponseDto and TripStatus

const props = defineProps<{
  trip: TripResponseDto // Use TripResponseDto type
}>()

const emit = defineEmits<{
  (e: 'openModal', id: number): void
  (e: 'navigate', page: string, id?: number): void
}>()

const isBookmarked = ref(false) // Assuming bookmarking is not directly tied to API status anymore

const statusColors: Record<TripStatus, string> = { // Use TripStatus enum
  COMPLETED: '#F9CA6B',
  PLANNED: '#9BCCC4',
  DRAFT: '#E88555', // Assuming DRAFT maps to '스크랩' color for now
}

const headerColor = computed(() => statusColors[props.trip.status] || '#9BCCC4')

const numberColors = ['#F9CA6B', '#9BCCC4', '#E88555']
const getNumberColor = (idx: number) => numberColors[idx % numberColors.length]

const handleShare = () => {
  alert('공유 기능 준비 중입니다!')
}

const displayDateRange = computed(() => {
  const start = props.trip.startDate
  const completed = props.trip.completedDate

  if (start) {
    return start
  } else if (completed) {
    return completed
  } else {
    return '날짜 미정'
  }
})
</script>

<style scoped>
/* 가로 스크롤바 숨기기 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
