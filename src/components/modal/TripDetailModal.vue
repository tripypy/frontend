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
      class="relative w-full max-w-6xl max-h-[85vh] bg-white border-[4px] border-[#2C2C2C] rounded-3xl shadow-[12px_12px_0px_0px_rgba(44,44,44,1)] flex flex-col overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="bg-white border-b-[3px] border-[#2C2C2C] px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between gap-6">
          <div class="flex-1">
            <h2 class="text-2xl font-black mb-2">{{ trip.title }}</h2>
            <div class="flex items-center gap-4 text-sm font-bold text-gray-600">
              <div class="flex items-center gap-2">
                <Calendar :size="18" :stroke-width="2.5" />
                <span>{{ trip.duration }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin :size="18" :stroke-width="2.5" />
                <span>{{ trip.spots }}개 장소</span>
              </div>
            </div>
          </div>
          <button
            @click="handleEditClick"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-xl font-black text-sm tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase"
          >
            <Edit :size="16" :stroke-width="3" /> 편집하기
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel - Course Details -->
        <div
          class="w-[380px] bg-white border-r-[3px] border-[#2C2C2C] flex flex-col overflow-hidden flex-shrink-0"
        >
          <!-- Days Tabs -->
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

          <!-- Places List -->
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

        <!-- Right Panel - Map -->
        <div class="flex-1 bg-gray-100 relative">
          <div id="kakao-map" class="w-full h-full"></div>

          <!-- Map Loading State -->
          <div
            v-if="!mapLoaded"
            class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E8F4F3] to-[#D4E9E7]"
          >
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C2C2C] mx-auto mb-4"
              ></div>
              <p class="font-bold text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Place Detail Modal -->
    <PlaceDetailModal v-if="selectedPlace" :place="selectedPlace" @close="selectedPlace = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar, MapPin, Edit } from 'lucide-vue-next'
import PlaceDetailModal from './PlaceDetailModal.vue'

interface Place {
  id: number
  name: string
  address: string
  category: string
  lat?: number
  lng?: number
}

interface DayPlan {
  dayNumber: number
  places: Place[]
}

interface Trip {
  id: number
  title: string
  spots: number
  duration: string
  description: string
  tags: string[]
  views: number
  imageUrl: string
}

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits(['close', 'edit'])

const activeDay = ref(1)
const selectedPlace = ref<Place | null>(null)
const mapLoaded = ref(false)
let map: any = null

// Mock data - 실제로는 API에서 가져와야 함
const days = ref<DayPlan[]>([
  {
    dayNumber: 1,
    places: [
      {
        id: 1,
        name: '대림창고',
        address: '서울시 성동구 성수동1가 656-1',
        category: '카페',
        lat: 37.5443,
        lng: 127.0557,
      },
      {
        id: 2,
        name: '그리노 성수',
        address: '서울시 성동구 왕십리로 83-21',
        category: '카페',
        lat: 37.5445,
        lng: 127.0559,
      },
      {
        id: 3,
        name: '테라로사 성수',
        address: '서울시 성동구 아차산로7길 12',
        category: '카페',
        lat: 37.5448,
        lng: 127.0562,
      },
    ],
  },
  {
    dayNumber: 2,
    places: [
      {
        id: 4,
        name: '성수연방',
        address: '서울시 성동구 연무장5길 7',
        category: '카페',
        lat: 37.544,
        lng: 127.0555,
      },
      {
        id: 5,
        name: '서울숲',
        address: '서울시 성동구 뚝섬로 273',
        category: '공원',
        lat: 37.5447,
        lng: 127.0374,
      },
    ],
  },
])

const currentDayPlaces = computed(() => {
  const day = days.value.find((d) => d.dayNumber === activeDay.value)
  return day ? day.places : []
})

const handleEditClick = () => {
  emit('edit', props.trip)
}

// 카카오맵 초기화
const initKakaoMap = () => {
  const container = document.getElementById('kakao-map')
  if (!container) {
    console.error('Map container not found')
    return
  }

  const options = {
    center: new (window as any).kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
    level: 5, // 확대 레벨
  }

  map = new (window as any).kakao.maps.Map(container, options)
  mapLoaded.value = true
  console.log('Map initialized successfully')
}

// ESC 키로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // 카카오맵 로드 및 초기화 (twalk SimpleMap.vue 방식)
  if ((window as any).kakao && (window as any).kakao.maps) {
    ;(window as any).kakao.maps.load(() => {
      initKakaoMap()
    })
  } else {
    console.error('Kakao Maps API not loaded')
  }
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
