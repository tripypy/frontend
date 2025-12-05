<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col font-sans">
    <!-- 헤더 -->
    <div class="bg-white border-b-[4px] border-black px-8 py-4 flex-shrink-0 z-30 relative">
      <div class="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
        <button
          @click="goBack"
          class="w-14 h-14 bg-white border-[4px] border-black rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] flex items-center justify-center transition-all flex-shrink-0 focus:outline-none active:shadow-none active:translate-x-0 active:translate-y-0"
          :title="isEditMode ? '취소' : '목록으로'"
        >
          <X v-if="isEditMode" class="w-7 h-7 text-black" stroke-width="3" />
          <ArrowLeft v-else class="w-7 h-7 text-black" stroke-width="3" />
        </button>

        <div class="flex-1">
          <input
            v-if="isEditMode"
            type="text"
            v-model="tripTitle"
            placeholder="여행 제목을 입력하세요"
            class="w-full px-6 py-3 border-[4px] border-black rounded-xl font-black text-3xl placeholder:text-gray-300 focus:outline-none focus:bg-gray-50 transition-all text-black"
            style="font-family: 'Outfit', sans-serif"
          />
          <h1
            v-else
            class="text-4xl font-black text-black px-2 truncate"
            style="font-family: 'Outfit', sans-serif"
          >
            {{ tripTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-6">
          <div
            class="flex items-center bg-white border-[4px] border-black rounded-xl px-5 h-14 gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center gap-3">
              <Calendar class="w-6 h-6 text-black" stroke-width="2.5" />
              <template v-if="isEditMode">
                <input
                  type="date"
                  v-model="tripDate"
                  class="font-bold text-xl text-black focus:outline-none cursor-pointer bg-transparent font-sans"
                />
              </template>
              <span v-else class="font-bold text-xl text-black font-sans">{{ formattedDate }}</span>
            </div>
            <div class="w-[3px] h-6 bg-black"></div>
            <div class="flex items-center gap-2">
              <MapPin class="w-6 h-6 text-black" stroke-width="2.5" />
              <span class="font-black text-xl text-black">{{ totalPlacesCount }}개 장소</span>
            </div>
          </div>

          <template v-if="isEditMode">
            <button
              @click="handleSave"
              class="flex items-center gap-3 px-8 h-14 bg-[#F9CA6B] border-[4px] border-black rounded-xl font-black text-xl tracking-tight shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase focus:outline-none active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0"
            >
              <Save class="w-6 h-6 text-black" stroke-width="3" />
              SAVE
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-3">
              <button
                @click="isEditMode = true"
                class="flex items-center gap-3 px-8 h-14 bg-[#9BCCC4] border-[4px] border-black rounded-xl font-black text-xl tracking-tight shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase focus:outline-none active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0"
              >
                <Edit class="w-6 h-6 text-black" stroke-width="3" />
                EDIT
              </button>
              <button
                @click="handleDelete"
                class="w-14 h-14 bg-white border-[4px] border-black rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] flex items-center justify-center transition-all focus:outline-none active:shadow-none active:translate-x-0 active:translate-y-0"
                title="삭제"
              >
                <Trash2 class="w-7 h-7 text-black" stroke-width="3" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 본문 -->
    <div class="flex-1 flex overflow-hidden relative z-10">
      <!-- 왼쪽: Day / 리스트 영역 -->
      <div
        class="w-[500px] bg-white border-r-[4px] border-black flex flex-col h-full relative flex-shrink-0 z-20 shadow-[6px_0px_0px_0px_rgba(0,0,0,0.1)]"
      >
        <div v-if="isEditMode" class="p-6 border-b-[4px] border-black bg-white relative z-30">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="장소를 검색하세요..."
              class="w-full pl-14 pr-4 py-4 border-[4px] border-black rounded-2xl font-bold text-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
            />
            <Search
              class="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-black"
              stroke-width="3"
            />
          </div>

          <div
            v-if="searchQuery"
            class="absolute left-6 right-6 top-[90px] z-50 bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[450px] overflow-y-auto"
          >
            <template v-if="filteredPlaces.length > 0">
              <button
                v-for="place in filteredPlaces"
                :key="place.id"
                @click="handleAddPlace(place)"
                class="w-full p-5 hover:bg-[#FFF8ED] transition-colors border-b-[3px] border-black last:border-0 text-left group flex items-start gap-4"
              >
                <div
                  class="w-12 h-12 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0 bg-[#9BCCC4] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <MapPin class="w-6 h-6 text-black" stroke-width="2.5" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-black text-lg mb-1 truncate text-black">{{ place.name }}</h4>
                  <p class="text-sm font-bold text-gray-600 truncate">{{ place.address }}</p>
                  <span
                    class="inline-block mt-2 px-2 py-0.5 bg-black text-white border-[2px] border-black rounded-md text-xs font-black uppercase"
                  >
                    {{ place.category }}
                  </span>
                </div>
                <div class="h-full flex items-center">
                  <Plus
                    class="w-7 h-7 text-gray-300 group-hover:text-black transition-colors"
                    stroke-width="4"
                  />
                </div>
              </button>
            </template>
            <div v-else class="p-8 text-center">
              <p class="text-lg font-bold text-gray-500">검색 결과가 없습니다</p>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          <div class="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar py-2 pl-1">
            <button
              v-for="day in days"
              :key="day.dayNumber"
              @click="activeDay = day.dayNumber"
              :class="[
                'px-5 py-2 rounded-full font-black text-sm uppercase tracking-wider transition-all flex-shrink-0 border-[3px] focus:outline-none',
                activeDay === day.dayNumber
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  : 'bg-white text-black border-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]',
              ]"
            >
              DAY {{ day.dayNumber }}
            </button>
            <button
              v-if="isEditMode"
              @click="handleAddDay"
              class="w-10 h-10 bg-[#F9CA6B] border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex-shrink-0 focus:outline-none active:shadow-none active:translate-0"
              title="일차 추가"
            >
              <Plus class="w-5 h-5 text-black" stroke-width="4" />
            </button>
          </div>

          <div class="flex items-end justify-between mb-5 px-1">
            <h3
              class="font-black text-2xl uppercase tracking-tight text-black"
              style="font-family: 'Outfit', sans-serif"
            >
              SELECTED <span class="text-[#E88555]">({{ currentDayPlaces.length }})</span>
            </h3>
            <button
              v-if="isEditMode && days.length > 1"
              @click="handleRemoveDay(activeDay)"
              class="text-xs font-black text-red-500 border-b-2 border-red-500 hover:text-red-700 hover:border-red-700 uppercase tracking-wide pb-0.5 transition-colors"
            >
              DELETE DAY {{ activeDay }}
            </button>
          </div>

          <div v-if="currentDayPlaces.length > 0" class="relative z-0">
            <draggable
              v-model="currentDayPlaces"
              item-key="id"
              class="space-y-4"
              ghost-class="opacity-50"
              handle=".drag-handle"
              :disabled="!isEditMode"
            >
              <template #item="{ element: place, index }">
                <div
                  class="bg-white border-[3px] border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all group p-4 flex items-center gap-4 relative"
                >
                  <div
                    v-if="isEditMode"
                    class="drag-handle cursor-grab p-1 text-gray-300 hover:text-black transition-colors absolute left-2 top-1/2 -translate-y-1/2"
                  >
                    <GripVertical class="w-6 h-6" stroke-width="2.5" />
                  </div>

                  <div
                    class="w-10 h-10 rounded-xl border-[3px] border-black flex items-center justify-center font-black text-lg flex-shrink-0 bg-[#9BCCC4] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    :class="{ 'ml-6': isEditMode }"
                  >
                    {{ index + 1 }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-lg truncate leading-tight mb-1 text-black">
                      {{ place.name }}
                    </h4>
                    <p class="text-sm font-bold text-gray-600 truncate">{{ place.category }}</p>
                  </div>

                  <button
                    v-if="isEditMode"
                    @click="handleRemovePlace(place.id)"
                    class="w-10 h-10 border-[3px] border-transparent rounded-xl hover:bg-red-100 hover:border-red-500 flex items-center justify-center transition-all flex-shrink-0 group/delete focus:outline-none"
                  >
                    <X
                      class="w-6 h-6 text-gray-300 group-hover/delete:text-red-500"
                      stroke-width="3"
                    />
                  </button>
                </div>
              </template>
            </draggable>
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-16 border-[4px] border-dashed border-gray-300 rounded-3xl bg-white/50"
          >
            <div
              class="w-16 h-16 bg-gray-100 border-[3px] border-gray-300 rounded-full flex items-center justify-center mb-4"
            >
              <MapPin class="w-7 h-7 text-gray-400" stroke-width="2.5" />
            </div>
            <p class="text-xl font-black text-gray-400 mb-1">아직 선택된 장소가 없어요</p>
            <p v-if="isEditMode" class="text-sm font-bold text-gray-400">
              위에서 장소를 검색해보세요
            </p>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 실제 카카오 지도 -->
      <div class="flex-1 relative z-0">
        <!-- KakaoMap 컴포넌트 -->
        <KakaoMap
          class="absolute inset-0"
          :center="{ lat: 37.5665, lng: 126.978 }"
          :level="5"
          :markers="markerPositions"
        />

        <!-- 우측 상단 플로팅 버튼들 (현재는 기능 없음, UI만 유지) -->
        <div class="absolute top-6 right-6 flex flex-col gap-3 z-20">
          <button
            class="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all focus:outline-none active:shadow-none active:translate-0"
          >
            <Plus class="w-6 h-6 text-black" stroke-width="3" />
          </button>
          <button
            class="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all focus:outline-none active:shadow-none active:translate-0"
          >
            <X class="w-6 h-6 text-black" stroke-width="3" style="transform: rotate(45deg)" />
          </button>
        </div>

        <!-- 선택된 장소가 없을 때만 중앙 오버레이 표시 -->
        <div
          v-if="totalPlacesCount === 0"
          class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div class="text-center relative">
            <div
              class="w-20 h-20 bg-white border-[4px] border-black rounded-full flex items-center justify-center mx-auto mb-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative z-10"
            >
              <MapPin class="w-9 h-9 text-black" stroke-width="2.5" />
            </div>
            <h3 class="text-3xl font-black text-black mb-2 font-sans">지도 영역</h3>
            <p class="text-lg font-bold text-gray-500">선택한 장소들이 여기에 표시됩니다</p>
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
} from 'lucide-vue-next'
import KakaoMap from '@/components/common/KakaoMap.vue'

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

// 2. Mock Data (검색용)
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
]

// 3. State
const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const tripTitle = ref('')
const tripDate = ref('')
const searchQuery = ref('')
const activeDay = ref(1)
const days = ref<DayPlan[]>([{ dayNumber: 1, places: [] }])

// 4. Computed
const filteredPlaces = computed(() => {
  if (!searchQuery.value) return []
  return mockPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

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

const totalPlacesCount = computed(() => allSelectedPlaces.value.length)

const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)

// KakaoMap에 내려줄 마커 목록
const markerPositions = computed(() =>
  allSelectedPlaces.value.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
  })),
)

// 5. Lifecycle & Init
onMounted(() => {
  const id = route.params.id
  if (id) {
    if (id === '1') {
      tripTitle.value = '성수동 감성 카페 투어'
      tripDate.value = '2024-12-15'
      days.value = [
        {
          dayNumber: 1,
          places: [mockPlaces[0]!, mockPlaces[1]!],
        },
      ]
    } else {
      tripTitle.value = `여행 계획 ${id}`
      tripDate.value = ''
    }
  }

  if (route.query.edit === 'true') {
    isEditMode.value = true
  }
})

// 6. Handlers
const goBack = () => {
  if (isEditMode.value) {
    if (confirm('수정 내용을 취소하시겠습니까?')) {
      isEditMode.value = false
      // 실제로는 데이터 원복 필요
    }
  } else {
    router.back()
  }
}

const handleSave = () => {
  if (!tripTitle.value.trim()) {
    alert('여행 제목을 입력해주세요!')
    return
  }
  isEditMode.value = false
  alert('저장되었습니다!')
}

const handleDelete = () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    alert('삭제되었습니다.')
    router.push('/trips')
  }
}

const handleAddPlace = (place: Place) => {
  const alreadyExists = currentDayPlaces.value.find((p) => p.id === place.id)
  if (!alreadyExists) {
    const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
    if (dayIndex !== -1) {
      days.value[dayIndex]!.places.push(place)
    }
  }
  searchQuery.value = ''
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

  if (confirm(`Day ${dayNum}을 삭제하시겠습니까?`)) {
    const filtered = days.value.filter((d) => d.dayNumber !== dayNum)
    days.value = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }))

    if (activeDay.value >= dayNum) {
      activeDay.value = Math.max(1, activeDay.value - 1)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.font-sans {
  font-family: 'Outfit', sans-serif;
}
</style>
