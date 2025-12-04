<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col">
    <div class="bg-white border-b-[3px] border-[#2C2C2C] px-6 py-3 flex-shrink-0">
      <div class="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        <button
          @click="goBack"
          class="w-9 h-9 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all flex-shrink-0"
          :title="isEditMode ? '취소' : '뒤로가기'"
        >
          <X v-if="isEditMode" class="w-4 h-4" stroke-width="2.5" />
          <ArrowLeft v-else class="w-4 h-4" stroke-width="2.5" />
        </button>

        <div class="flex-1 max-w-md">
          <input
            v-if="isEditMode"
            type="text"
            v-model="tripTitle"
            placeholder="여행 이름을 입력하세요"
            class="w-full px-4 py-2 border-[2px] border-[#2C2C2C] rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9BCCC4]"
          />
          <div
            v-else
            class="w-full px-4 py-2 border-[2px] border-gray-300 rounded-lg font-bold text-sm bg-gray-50"
          >
            {{ tripTitle }}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-4 pr-4 border-r-[2px] border-gray-300">
            <div class="flex items-center gap-2 relative">
              <Calendar class="w-5 h-5 text-gray-600" stroke-width="2.5" />
              <template v-if="isEditMode">
                <input
                  type="date"
                  v-model="tripDate"
                  class="px-3 py-1.5 border-[2px] border-[#2C2C2C] rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#9BCCC4] cursor-pointer bg-white text-sm"
                />
              </template>
              <span v-else class="font-bold text-gray-700 text-[15px]">{{ formattedDate }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-5 h-5 text-gray-600" stroke-width="2.5" />
              <span class="font-bold text-gray-700 text-[15px]"
                >{{ allSelectedPlaces.length }}개 장소</span
              >
            </div>
          </div>

          <template v-if="isEditMode">
            <button
              @click="handleSave"
              class="flex items-center gap-2 px-4 py-2 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase flex-shrink-0"
            >
              <Save class="w-3.5 h-3.5" stroke-width="3" /> Save
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-2">
              <button
                @click="isEditMode = true"
                class="flex items-center gap-2 px-4 py-2 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase flex-shrink-0"
              >
                <Edit class="w-3.5 h-3.5" stroke-width="3" /> Edit
              </button>
              <button
                @click="handleDelete"
                class="w-9 h-9 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all flex-shrink-0"
                title="삭제"
              >
                <Trash2 class="w-4 h-4" stroke-width="2.5" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <div
        class="w-[380px] bg-white border-r-[3px] border-[#2C2C2C] flex flex-col h-full relative flex-shrink-0"
      >
        <div v-if="isEditMode" class="p-3 border-b-[2px] border-gray-200 relative z-20">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="장소를 검색하세요..."
              class="w-full pl-8 pr-3 py-1.5 border-[2px] border-[#2C2C2C] rounded-lg font-bold text-[11px] focus:outline-none focus:ring-2 focus:ring-[#9BCCC4]"
            />
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              stroke-width="2.5"
            />
          </div>

          <div
            v-if="searchQuery"
            class="absolute z-50 mt-1.5 left-3 right-3 bg-white border-[3px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] max-h-72 overflow-y-auto"
          >
            <template v-if="filteredPlaces.length > 0">
              <button
                v-for="place in filteredPlaces"
                :key="place.id"
                @click="handleAddPlace(place)"
                class="w-full p-2.5 hover:bg-[#FFF8ED] transition-colors border-b-[2px] border-gray-200 last:border-0 text-left group"
              >
                <div class="flex items-start gap-2">
                  <div
                    class="w-7 h-7 rounded-md border-[2px] border-[#2C2C2C] flex items-center justify-center flex-shrink-0 bg-[#9BCCC4]"
                  >
                    <MapPin class="w-3.5 h-3.5" stroke-width="2.5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-[11px] mb-0.5 truncate">{{ place.name }}</h4>
                    <p class="text-[9px] font-bold text-gray-600 truncate">{{ place.address }}</p>
                  </div>
                  <Plus
                    class="w-3 h-3 text-gray-400 group-hover:text-[#2C2C2C] transition-colors flex-shrink-0"
                    stroke-width="2.5"
                  />
                </div>
              </button>
            </template>
            <div v-else class="p-3 text-center">
              <p class="text-[11px] font-bold text-gray-500">검색 결과가 없습니다</p>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 bg-gray-50">
          <div class="flex items-center gap-1 mb-2.5 overflow-x-auto no-scrollbar">
            <button
              v-for="day in days"
              :key="day.dayNumber"
              @click="activeDay = day.dayNumber"
              :class="[
                'px-2.5 py-1 rounded-md font-black text-[9px] uppercase tracking-wide transition-all flex-shrink-0',
                activeDay === day.dayNumber
                  ? 'bg-[#2C2C2C] text-white border-[2px] border-[#2C2C2C]'
                  : 'bg-white text-gray-600 border-[2px] border-gray-300 hover:border-[#2C2C2C]',
              ]"
            >
              Day {{ day.dayNumber }}
            </button>
            <button
              v-if="isEditMode"
              @click="handleAddDay"
              class="px-1.5 py-1 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-md font-black text-[9px] uppercase tracking-wide hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.3)] transition-all flex-shrink-0"
            >
              <Plus class="w-3 h-3" stroke-width="3" />
            </button>
          </div>

          <div class="flex items-center justify-between mb-2">
            <h3 class="font-black text-[9px] uppercase tracking-wide text-gray-700">
              Selected ({{ currentDayPlaces.length }})
            </h3>
            <button
              v-if="isEditMode && days.length > 1"
              @click="handleRemoveDay(activeDay)"
              class="text-[8px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wide"
            >
              Delete Day {{ activeDay }}
            </button>
          </div>

          <div v-if="currentDayPlaces.length > 0">
            <draggable
              v-model="currentDayPlaces"
              item-key="id"
              class="space-y-1.5 mb-4"
              ghost-class="opacity-50"
              handle=".drag-handle"
              :disabled="!isEditMode"
            >
              <template #item="{ element: place, index }">
                <div
                  class="p-1.5 bg-white border-[2px] border-[#2C2C2C] rounded-md hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.2)] transition-all group flex items-center gap-1.5"
                  :class="{ 'cursor-move': isEditMode }"
                >
                  <div v-if="isEditMode" class="drag-handle flex-shrink-0 cursor-grab">
                    <GripVertical class="w-3 h-3 text-gray-400" stroke-width="2.5" />
                  </div>
                  <div
                    class="w-5 h-5 rounded border-[2px] border-[#2C2C2C] flex items-center justify-center font-black text-[10px] flex-shrink-0 bg-[#9BCCC4]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-[11px] truncate leading-tight">{{ place.name }}</h4>
                    <p class="text-[9px] font-bold text-gray-600 truncate">{{ place.category }}</p>
                  </div>
                  <button
                    v-if="isEditMode"
                    @click="handleRemovePlace(place.id)"
                    class="w-4 h-4 bg-red-50 border-[1px] border-red-300 rounded hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X class="w-2.5 h-2.5 text-red-600" stroke-width="2.5" />
                  </button>
                </div>
              </template>
            </draggable>
          </div>

          <div v-else class="text-center py-6 mb-4">
            <div
              class="w-10 h-10 bg-gray-100 border-[2px] border-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center"
            >
              <MapPin class="w-5 h-5 text-gray-400" stroke-width="2" />
            </div>
            <p class="text-[11px] font-bold text-gray-500">아직 선택된 장소가 없어요</p>
            <p v-if="isEditMode" class="text-[9px] font-bold text-gray-400 mt-0.5">
              위에서 장소를 검색해보세요
            </p>
          </div>

          <div v-if="isEditMode">
            <h3 class="font-black text-[9px] uppercase tracking-wide text-gray-700 mb-1.5">
              Recommended
            </h3>
            <div class="space-y-1">
              <button
                v-for="place in recommendedPlaces"
                :key="place.id"
                @click="handleAddPlace(place)"
                class="w-full p-1.5 bg-gray-50 border-[2px] border-gray-200 rounded-md hover:border-[#2C2C2C] hover:bg-white transition-all text-left group"
              >
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-5 h-5 rounded border-[2px] border-[#2C2C2C] flex items-center justify-center flex-shrink-0 bg-[#9BCCC4]"
                  >
                    <MapPin class="w-3 h-3" stroke-width="2.5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-[11px] truncate leading-tight">{{ place.name }}</h4>
                    <p class="text-[9px] font-bold text-gray-600 truncate">{{ place.category }}</p>
                  </div>
                  <Plus
                    class="w-3 h-3 text-gray-400 group-hover:text-[#2C2C2C] transition-colors flex-shrink-0"
                    stroke-width="2.5"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 bg-gray-100 relative z-0">
        <div class="w-full h-full relative bg-gradient-to-br from-[#E8F4F3] to-[#D4E9E7]">
          <div
            class="absolute inset-0"
            style="
              background-image:
                linear-gradient(#c4d9d7 1px, transparent 1px),
                linear-gradient(90deg, #c4d9d7 1px, transparent 1px);
              background-size: 50px 50px;
            "
          ></div>

          <div
            v-for="(place, index) in allSelectedPlaces"
            :key="place.id"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            :style="getMarkerPosition(index)"
          >
            <div class="relative z-10">
              <div
                class="w-12 h-12 rounded-full border-[3px] border-[#2C2C2C] flex items-center justify-center font-black shadow-[3px_3px_0px_0px_rgba(44,44,44,0.4)] hover:scale-110 transition-transform bg-[#9BCCC4] text-[#2C2C2C] text-lg"
              >
                {{ index + 1 }}
              </div>
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20"
              >
                <div
                  class="bg-white border-[2px] border-[#2C2C2C] rounded-lg px-3 py-2 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.3)]"
                >
                  <p class="font-black text-xs">{{ place.name }}</p>
                  <p class="text-[10px] font-bold text-gray-500">{{ place.category }}</p>
                </div>
              </div>
            </div>

            <svg
              v-if="index < allSelectedPlaces.length - 1"
              class="absolute top-6 left-6 w-48 h-48 pointer-events-none overflow-visible"
              style="z-index: 0"
            >
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="50"
                stroke="#2C2C2C"
                stroke-width="2"
                stroke-dasharray="5,5"
              />
            </svg>
          </div>

          <div
            v-if="allSelectedPlaces.length === 0"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="text-center">
              <MapPin class="w-12 h-12 text-gray-400 mx-auto mb-3" stroke-width="2" />
              <p class="font-bold text-gray-600">지도 영역</p>
              <p class="text-sm text-gray-500 mt-1">선택한 장소들이 여기에 표시됩니다</p>
            </div>
          </div>

          <div class="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
            <button
              class="w-8 h-8 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[2px_2px_0px_0px_rgba(44,44,44,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.5)] flex items-center justify-center transition-all font-black"
            >
              +
            </button>
            <button
              class="w-8 h-8 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[2px_2px_0px_0px_rgba(44,44,44,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.5)] flex items-center justify-center transition-all font-black"
            >
              −
            </button>
            <button
              class="w-8 h-8 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[2px_2px_0px_0px_rgba(44,44,44,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.5)] flex items-center justify-center transition-all"
            >
              <Navigation class="w-4 h-4" stroke-width="2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  X,
  Search,
  Plus,
  GripVertical,
  Trash2,
  Edit,
  Navigation,
} from 'lucide-vue-next'

// 1. Interfaces
interface Place {
  id: number
  name: string
  address: string
  category: string
  lat: number
  lng: number
}
interface DayPlan {
  dayNumber: number
  places: Place[]
}

// 2. Mock Data
const mockPlaces: Place[] = [
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
    name: '대림창고 옆 공원',
    address: '서울시 성동구 성수동1가',
    category: '공원',
    lat: 37.5442,
    lng: 127.0558,
  },
  {
    id: 6,
    name: '서울숲',
    address: '서울시 성동구 뚝섬로 273',
    category: '공원',
    lat: 37.5447,
    lng: 127.0374,
  },
  {
    id: 7,
    name: '을지로 인쇄골목',
    address: '서울시 중구 을지로',
    category: '관광지',
    lat: 37.566,
    lng: 126.991,
  },
  {
    id: 8,
    name: '레스토랑 소공',
    address: '서울시 중구 을지로 34',
    category: '음식점',
    lat: 37.5662,
    lng: 126.9912,
  },
  {
    id: 9,
    name: '망원시장',
    address: '서울시 마포구 망원동 410-2',
    category: '시장',
    lat: 37.5556,
    lng: 126.91,
  },
  {
    id: 10,
    name: '북촌한옥마을',
    address: '서울시 종로구 북촌로 37',
    category: '관광지',
    lat: 37.5825,
    lng: 126.983,
  },
]

// 3. State
const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const tripTitle = ref('성수동 카페 투어')
const tripDate = ref('2024-12-15')
const searchQuery = ref('')
const activeDay = ref(1)
const days = ref<DayPlan[]>([{ dayNumber: 1, places: [mockPlaces[0]!, mockPlaces[1]!] }]) // 초기 데이터

// 4. Computed
const filteredPlaces = computed(() => {
  if (!searchQuery.value) return []
  return mockPlaces.filter(
    (p) => p.name.includes(searchQuery.value) || p.address.includes(searchQuery.value),
  )
})

// v-model for draggable (Safe with getter/setter)
const currentDayPlaces = computed({
  get: () => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    return day ? day.places : []
  },
  set: (newPlaces) => {
    const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
    if (dayIndex !== -1) {
      days.value[dayIndex]!.places = newPlaces
    }
  },
})

const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))
// const totalPlacesCount = computed(() => allSelectedPlaces.value.length)
const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)
const recommendedPlaces = computed(() =>
  mockPlaces.slice(0, 4).filter((p) => !currentDayPlaces.value.find((cp) => cp.id === p.id)),
)

// 5. Methods
const goBack = () => {
  if (isEditMode.value) {
    if (confirm('취소하시겠습니까?')) isEditMode.value = false
  } else {
    router.back()
  }
}

const handleSave = () => {
  isEditMode.value = false
  alert('저장되었습니다!')
}
const handleDelete = () => {
  if (confirm('삭제하시겠습니까?')) {
    alert('삭제됨')
    router.push('/trips')
  }
}
const handleAddPlace = (place: Place) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1 && !days.value[dayIndex]!.places.find((p) => p.id === place.id)) {
    days.value[dayIndex]!.places.push(place)
    searchQuery.value = ''
  }
}
const handleRemovePlace = (placeId: number) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1) {
    days.value[dayIndex]!.places = days.value[dayIndex]!.places.filter((p) => p.id !== placeId)
  }
}
const handleAddDay = () => {
  const newDay = days.value.length + 1
  days.value.push({ dayNumber: newDay, places: [] })
  activeDay.value = newDay
}
const handleRemoveDay = (dayNum: number) => {
  if (days.value.length <= 1) return
  days.value = days.value
    .filter((d) => d.dayNumber !== dayNum)
    .map((d, i) => ({ ...d, dayNumber: i + 1 }))
  if (activeDay.value === dayNum) activeDay.value = days.value[0]?.dayNumber ?? 1
  else if (activeDay.value > dayNum) activeDay.value = activeDay.value - 1
}

// Mock Map Position Generator
const getMarkerPosition = (index: number) => {
  const positions = [
    { top: '30%', left: '40%' },
    { top: '45%', left: '55%' },
    { top: '60%', left: '35%' },
    { top: '35%', left: '65%' },
    { top: '55%', left: '50%' },
    { top: '40%', left: '70%' },
  ]
  return positions[index % positions.length]
}

// Lifecycle
onMounted(() => {
  // URL에 edit 쿼리가 있거나(수정 모드 진입), create-trip 경로인 경우(생성 모드)
  if (route.query.edit === 'true' || route.name === 'create-trip') {
    isEditMode.value = true
  }
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
