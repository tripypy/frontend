<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C2C2C] mx-auto mb-4"
      ></div>
      <p class="font-bold text-gray-500">여행 정보를 불러오는 중...</p>
    </div>
  </div>

  <div v-else-if="isError" class="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
    <div class="text-center">
      <p class="font-bold text-red-500 mb-2">데이터를 불러오지 못했습니다.</p>
      <button
        @click="fetchTripData"
        class="px-4 py-2 bg-white border-2 border-[#2C2C2C] rounded-lg font-bold hover:bg-gray-50"
      >
        다시 시도
      </button>
    </div>
  </div>

  <div v-else class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col">
    <div class="bg-white border-b-[3px] border-[#2C2C2C] px-6 py-3 flex-shrink-0">
      <div class="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        <button
          @click="goBack"
          class="w-9 h-9 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all flex-shrink-0"
          :title="isEditMode ? '취소' : '뒤로가기'"
        >
          <ArrowLeft class="w-4 h-4" stroke-width="2.5" />
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
              @keyup.enter="handleSearchPlaces"
              placeholder="장소를 검색하세요 (Enter)"
              class="w-full pl-8 pr-3 py-1.5 border-[2px] border-[#2C2C2C] rounded-lg font-bold text-[11px] focus:outline-none focus:ring-2 focus:ring-[#9BCCC4]"
            />
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 cursor-pointer"
              @click="handleSearchPlaces"
              stroke-width="2.5"
            />
          </div>

          <div
            v-if="searchQuery && showSearchResults"
            class="absolute z-50 mt-1.5 left-3 right-3 bg-white border-[3px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] max-h-72 overflow-y-auto"
          >
            <div v-if="isSearching" class="p-4 text-center">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2C2C2C] mx-auto"
              ></div>
            </div>
            <template v-else-if="searchResults.length > 0">
              <button
                v-for="place in searchResults"
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
        </div>
      </div>

      <div class="flex-1 bg-gray-100 relative z-0">
        <KakaoMap
          class="w-full h-full"
          :center="{ lat: 37.5665, lng: 126.978 }"
          :level="7"
          :markers="markerPositions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KakaoMap from '@/components/common/KakaoMap.vue'
import { ref, computed, onMounted, watch } from 'vue'
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

// 2. State & Refs
const route = useRoute()
const router = useRouter()

// UI State
const isLoading = ref(true)
const isError = ref(false)
const isEditMode = ref(false)
const isSearching = ref(false)
const showSearchResults = ref(false)

// Data State
const tripId = ref<number | null>(null)
const tripTitle = ref('')
const tripDate = ref('') // YYYY-MM-DD
const activeDay = ref(1)
const days = ref<DayPlan[]>([])

// Search State
const searchQuery = ref('')
const searchResults = ref<Place[]>([])

// Computed
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

const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)
const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))

const markerPositions = computed(() =>
  allSelectedPlaces.value
    .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id,
    })),
)

// 4. Methods (API Integration)

const fetchTripData = async () => {
  if (!tripId.value) return

  isLoading.value = true
  isError.value = false

  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    tripTitle.value = '불러온 여행 제목'
    tripDate.value = '2024-12-25'
    days.value = [{ dayNumber: 1, places: [] }]
  } catch (error) {
    console.error('Failed to fetch trip data:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

const handleSearchPlaces = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  isSearching.value = true
  showSearchResults.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log(`Searching for: ${searchQuery.value}`)
    searchResults.value = [
      {
        id: 101,
        name: `${searchQuery.value} 카페`,
        address: '서울시 강남구',
        category: '카페',
        lat: 37.514575,
        lng: 127.0495556,
      },
      {
        id: 102,
        name: `${searchQuery.value} 공원`,
        address: '서울시 서초구',
        category: '공원',
        lat: 37.5132,
        lng: 127.0589,
      },
    ]
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isSearching.value = false
  }
}

const handleSave = async () => {
  try {
    const payload = {
      title: tripTitle.value,
      date: tripDate.value,
      days: days.value,
    }
    console.log('Saving Trip:', payload)
    isEditMode.value = false
    alert('저장되었습니다!')
  } catch (error) {
    alert('저장에 실패했습니다.')
  }
}

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    alert('삭제되었습니다.')
    router.push('/trips')
  } catch (error) {
    alert('삭제에 실패했습니다.')
  }
}

const goBack = () => {
  if (isEditMode.value) {
    if (confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
      isEditMode.value = false
      if (!tripId.value) router.back()
    }
  } else {
    router.back()
  }
}

const handleAddPlace = (place: Place) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1) {
    if (!days.value[dayIndex]!.places.find((p) => p.id === place.id)) {
      days.value[dayIndex]!.places.push(place)
    }
  }
  searchQuery.value = ''
  showSearchResults.value = false
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

// 5. Lifecycle
onMounted(() => {
  const idParam = route.params.id

  if (route.name === 'create-trip' || !idParam) {
    isLoading.value = false
    isEditMode.value = true
    tripId.value = null
    days.value = [{ dayNumber: 1, places: [] }]
  } else {
    tripId.value = Number(idParam)
    fetchTripData()
    if (route.query.edit === 'true') {
      isEditMode.value = true
    }
  }
})

watch(searchQuery, (newVal) => {
  if (!newVal) {
    showSearchResults.value = false
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
