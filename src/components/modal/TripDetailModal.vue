<template>
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
    @click="emit('close')"
  >
    <button
      @click="emit('close')"
      class="absolute top-6 right-6 z-10 text-white hover:opacity-80 transition-opacity"
    >
      <span class="font-black text-3xl drop-shadow-[2px_2px_6px_rgba(0,0,0,0.6)]">✕</span>
    </button>

    <div
      class="relative w-full max-w-4xl h-[80vh] bg-white border-[4px] border-[#2C2C2C] rounded-3xl shadow-[12px_12px_0px_0px_rgba(44,44,44,1)] flex flex-col overflow-hidden"
      @click.stop
    >
      <div class="bg-white border-b-[3px] border-[#2C2C2C] px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between gap-6">
          <div class="flex-1">
            <h2 class="text-2xl font-black mb-2">{{ trip.title }}</h2>
            <div class="flex items-center gap-4 text-sm font-bold text-gray-600">
              <div class="flex items-center gap-2">
                <Calendar :size="18" :stroke-width="2.5" />
                <span>{{ displayDuration }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin :size="18" :stroke-width="2.5" />
                <span>{{ trip.tripItems.length }}개 장소</span>
              </div>
            </div>
          </div>
          <button
            @click="handleEditClick"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-xl font-black text-sm tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase"
          >
            <Edit :size="16" :stroke-width="3" /> EDIT
          </button>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <div
          class="w-[320px] bg-white border-r-[3px] border-[#2C2C2C] flex flex-col overflow-hidden flex-shrink-0"
        >
          <div class="p-4 border-b-[2px] border-gray-200">
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                v-for="day in days"
                :key="day.dayNumber"
                @click="activeDay = day.dayNumber"
                :class="[
                  'px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide transition-all flex-shrink-0 border-[2px]',
                  activeDay === day.dayNumber
                    ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#2C2C2C]',
                ]"
              >
                Day {{ day.dayNumber }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
            <h3 class="font-black text-sm uppercase tracking-wide text-gray-700 mb-3">
              선택된 장소 ({{ currentDayPlaces.length }})
            </h3>

            <div v-if="currentDayPlaces.length > 0" class="space-y-2">
              <div
                v-for="(place, index) in currentDayPlaces"
                :key="place.id"
                class="p-3 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.2)] transition-all cursor-pointer group"
                @click="selectedPlace = place"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg border-[2px] border-[#2C2C2C] flex items-center justify-center font-black text-sm flex-shrink-0 bg-[#9BCCC4]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-sm truncate leading-tight">{{ place.name }}</h4>
                    <p class="text-xs font-bold text-gray-600 truncate">{{ place.category }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <div
                class="w-12 h-12 bg-gray-100 border-[2px] border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center"
              >
                <MapPin :size="24" :stroke-width="2" class="text-gray-400" />
              </div>
              <p class="text-sm font-bold text-gray-500">선택된 장소가 없습니다</p>
            </div>
          </div>
        </div>

        <div class="flex-1 bg-gray-100 relative">
          <KakaoMap
            class="w-full h-full"
            :center="mapCenter"
            :level="7"
            :markers="markerPositions"
          />

          <div
            v-if="markerPositions.length === 0"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="text-center">
              <div
                class="w-14 h-14 bg-white border-[3px] border-[#2C2C2C] rounded-full flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_0px_rgba(44,44,44,0.4)]"
              >
                <MapPin :size="26" :stroke-width="2.5" class="text-[#2C2C2C]" />
              </div>
              <p class="font-bold text-gray-700">코스에 담긴 장소가 지도에 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PlaceDetailModal v-if="selectedPlace" :place="selectedPlace" @close="selectedPlace = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar, MapPin, Edit } from 'lucide-vue-next'
import PlaceDetailModal from './PlaceDetailModal.vue'
import KakaoMap from '@/components/common/KakaoMap.vue'
import { TripDetailResponseDto, SpotResponseDto } from '@/types/trip' // Import types

interface DayPlanDisplay {
  dayNumber: number
  places: SpotResponseDto[]
}

const props = defineProps<{
  trip: TripDetailResponseDto & { duration?: string; description?: string; views?: number; imageUrl?: string } // Extend with optional fields from TripView
}>()

const emit = defineEmits(['close', 'edit'])

const activeDay = ref(1)
const selectedPlace = ref<SpotResponseDto | null>(null) // Changed type

// trip.tripItems를 DayPlanDisplay[] 형태로 변환
const days = computed<DayPlanDisplay[]>(() => {
  const grouped = props.trip.tripItems.reduce((acc, item) => {
    if (!acc[item.dayNumber]) {
      acc[item.dayNumber] = { dayNumber: item.dayNumber, places: [] }
    }
    acc[item.dayNumber].places.push(item.spot)
    return acc
  }, {} as Record<number, DayPlanDisplay>)

  return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber)
})

const currentDayPlaces = computed(() => {
  const day = days.value.find((d) => d.dayNumber === activeDay.value)
  return day ? day.places : []
})

// KakaoMap에 내려줄 마커 리스트
const markerPositions = computed(() =>
  currentDayPlaces.value
    .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
    .map((p, index) => ({
      id: p.id,
      lat: p.lat as number,
      lng: p.lng as number,
      type: 'plan' as const,
      order: index + 1,
    })),
)

// 지도 중심 좌표: 현재 Day의 첫 번째 장소 기준, 없으면 기본값
const mapCenter = computed(() => {
  const first = currentDayPlaces.value.find(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number',
  )
  if (first && typeof first.lat === 'number' && typeof first.lng === 'number') {
    return { lat: first.lat, lng: first.lng }
  }
  return { lat: 37.5665, lng: 126.978 } // 기본 서울 시청
})

const handleEditClick = () => {
  emit('edit', props.trip)
}

const displayDuration = computed(() => {
  const start = props.trip.startDate

  if (start) {
    return start
  } else {
    return '날짜 미정'
  }
})

// ESC 키로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
