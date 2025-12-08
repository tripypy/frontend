<template>
  <div
    v-if="place"
    class="h-64 bg-white border-t-[3px] border-[#2C2C2C] p-4 relative flex-shrink-0 overflow-y-auto"
  >
    <button
      @click="$emit('close')"
      class="absolute top-3 right-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors z-10"
    >
      <X :size="16" />
    </button>

    <div class="flex gap-4 h-full">
      <!-- Left Column: Info -->
      <div class="flex-1 flex flex-col">
        <p class="text-xs font-bold text-gray-500 mb-1">{{ place.category }}</p>
        <h3 class="text-2xl font-black mb-2 leading-tight">{{ place.name }}</h3>

        <div class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="(tag, index) in mockData.tags"
            :key="index"
            class="px-2 py-0.5 border-[1.5px] border-[#2C2C2C] rounded-full bg-[#B4E4FF] text-[10px] font-black"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="mt-auto space-y-2 text-xs">
          <div class="flex items-center gap-2 font-bold">
            <MapPin :size="14" class="flex-shrink-0" />
            <span class="truncate">{{ place.address }}</span>
          </div>
          <div v-if="place.url" class="flex items-center gap-2 font-bold">
            <Globe :size="14" class="flex-shrink-0" />
            <a
              :href="place.url"
              target="_blank"
              class="truncate text-blue-600 hover:underline"
              @click.stop
            >
              {{ place.url }}
            </a>
          </div>
        </div>
      </div>

      <!-- Right Column: Ratings & Reviews -->
      <div class="w-48 flex flex-col border-l-2 border-gray-200 pl-4">
        <!-- Average Rating -->
        <div class="mb-3">
          <p class="text-xs font-black text-gray-600 uppercase">평균 평점</p>
          <div class="flex items-baseline gap-1">
            <span class="font-black text-2xl">{{ mockData.rating }}</span>
            <span class="text-xs font-bold text-gray-500">/ 5.0</span>
          </div>
        </div>

        <!-- My Rating -->
        <div class="mb-4">
          <p class="text-xs font-black text-gray-600 uppercase mb-1">내 평가</p>
          <div class="flex items-center gap-1 cursor-pointer" @mouseleave="handleStarLeave">
            <div
              v-for="star in 5"
              :key="star"
              class="relative w-6 h-6"
              @mousemove="(e) => handleStarHover(star - 1, e)"
              @click="(e) => handleStarClick(star - 1, e)"
            >
              <Star class="absolute inset-0 w-6 h-6 fill-none text-gray-300" stroke-width="2" />
              <div
                class="absolute inset-0 overflow-hidden"
                :style="{ width: `${getStarFillPercent(star - 1)}%` }"
              >
                <Star
                  :class="[
                    'absolute left-0 w-6 h-6',
                    hoverRating > 0 || userRating === 0
                      ? 'fill-[#FFD60A] text-[#FFD60A]'
                      : 'fill-[#FF1493] text-[#FF1493]',
                  ]"
                  stroke-width="2"
                />
              </div>
            </div>
          </div>
          <p v-if="userRating > 0" class="text-xs font-bold text-[#FF1493] mt-1">
            내 평가: {{ userRating.toFixed(1) }}
          </p>
        </div>

        <!-- Reviews Placeholder -->
        <div class="mt-auto">
          <button
            class="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-400 rounded-lg border-2 border-dashed border-gray-300"
            disabled
          >
            <MessageSquare :size="14" />
            <span class="text-xs font-bold">리뷰 (준비 중)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, MapPin, Globe, Star, MessageSquare } from 'lucide-vue-next'
import type { SpotResponseDto } from '@/types/trip'

const props = defineProps<{
  place: SpotResponseDto | null
}>()

defineEmits(['close'])

// --- Mock Data ---
const mockData = {
  rating: 4.8,
  tags: ['카페', '디저트', '감성'],
}

// --- Star Rating Logic ---
const userRating = ref<number>(0)
const hoverRating = ref<number>(0)

const getAverageRatingRounded = () => {
  return Math.floor(mockData.rating * 2) / 2
}

const handleStarHover = (starIndex: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  hoverRating.value = x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1
}

const handleStarClick = (starIndex: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const rating = x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1
  userRating.value = userRating.value === rating ? 0 : rating
}

const handleStarLeave = () => {
  hoverRating.value = 0
}

const getStarFillPercent = (starIndex: number) => {
  const displayRating = hoverRating.value || userRating.value || getAverageRatingRounded()
  const starPosition = starIndex + 1
  if (displayRating >= starPosition) return 100
  if (displayRating > starIndex) return (displayRating - starIndex) * 100
  return 0
}
</script>
