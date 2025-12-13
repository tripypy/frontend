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
              <div class="flex items-center gap-2">
                <ListChecks :size="18" :stroke-width="2.5" />
                <span>{{ trip.status }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Shield :size="18" :stroke-width="2.5" />
                <span>{{ trip.visibility }}</span>
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
                @click="handlePlaceClick(place)"
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

        <div class="flex-1 flex flex-col bg-gray-100">
          <!-- Map Container -->
          <div class="flex-1 relative">
            <KakaoMap
              ref="kakaoMapRef"
              class="absolute inset-0 w-full h-full"
              :center="mapCenter"
              :level="7"
              :markers="markerPositions"
              :selected-marker-id="selectedMarkerId"
              @marker-click="handleMarkerClick"
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

          <!-- Place Detail Panel -->
          <PlaceDetailPanel :place="selectedPlace" @close="selectedPlace = null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { Calendar, MapPin, Edit, ListChecks, Shield } from 'lucide-vue-next'
import KakaoMap from '@/components/common/KakaoMap.vue'
import PlaceDetailPanel from '@/components/trip/PlaceDetailPanel.vue'
import type { TripDetailResponseDto, SpotResponseDto} from '@/apis/trip/types'

interface DayPlanDisplay {
  dayNumber: number
  places: SpotResponseDto[]
}

const props = defineProps<{
  trip: TripDetailResponseDto & { duration?: string; description?: string; views?: number; imageUrl?: string }
  initialPlaceId?: number | null
}>()

const emit = defineEmits(['close', 'edit'])

const kakaoMapRef = ref<any>(null)
const activeDay = ref(1)
const selectedPlace = ref<SpotResponseDto | null>(null)
const selectedMarkerId = ref<number | string | null>(null)

const days = computed<DayPlanDisplay[]>(() => {
  const grouped = props.trip.tripItems.reduce((acc, item) => {
    if (!acc[item.dayNumber]) {
      acc[item.dayNumber] = { dayNumber: item.dayNumber, places: [] }
    }
    acc[item.dayNumber]!.places.push(item.spot)
    return acc
  }, {} as Record<number, DayPlanDisplay>)

  return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber)
})

watchEffect(() => {
  if (props.initialPlaceId) {
    const initialItem = props.trip.tripItems.find(item => item.spot.id === props.initialPlaceId)
    if (initialItem) {
      activeDay.value = initialItem.dayNumber
      // DOM 업데이트를 기다린 후 클릭 핸들러를 호출
      setTimeout(() => {
        handlePlaceClick(initialItem.spot)
      }, 0)
    }
  } else if (days.value.length > 0) {
    activeDay.value = days.value[0]!.dayNumber
  }
})

const currentDayPlaces = computed(() => {
  const day = days.value.find((d) => d.dayNumber === activeDay.value)
  return day ? day.places : []
})

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

const mapCenter = computed(() => {
  const first = currentDayPlaces.value.find(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number',
  )
  if (first && typeof first.lat === 'number' && typeof first.lng === 'number') {
    return { lat: first.lat, lng: first.lng }
  }
  return { lat: 37.5665, lng: 126.978 }
})

const handleEditClick = () => {
  emit('edit', props.trip)
}

const handlePlaceClick = (place: SpotResponseDto) => {
  selectedPlace.value = place
  selectedMarkerId.value = place.id
  if (place.lat && place.lng && kakaoMapRef.value) {
    let finalLat = place.lat

    const map = kakaoMapRef.value.map
    if (!map) {
      kakaoMapRef.value.panTo(place.lat, place.lng)
      return
    }

    const bounds = map.getBounds()
    const mapDiv = kakaoMapRef.value.$el

    if (bounds && mapDiv && mapDiv.offsetHeight > 0) {
      const mapHeightInPixels = mapDiv.offsetHeight
      // 패널 높이(256px)의 약 1/3인 85px을 오프셋으로 사용
      const pixelOffset = 85

      const latSpan = bounds.getNorthEast().getLat() - bounds.getSouthWest().getLat()
      const latOffset = (latSpan / mapHeightInPixels) * pixelOffset

      // 중심을 아래로 이동시켜 마커가 패널 위로 보이게 함
      finalLat -= latOffset
    }

    kakaoMapRef.value.panTo(finalLat, place.lng)
  }
}

const handleMarkerClick = (id: number | string) => {
  const place = currentDayPlaces.value.find((p) => p.id === id)
  if (place) {
    handlePlaceClick(place)
  }
}

const displayDuration = computed(() => {
  const start = props.trip.startDate
  if (start) {
    return start
  } else {
    return '날짜 미정'
  }
})

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
