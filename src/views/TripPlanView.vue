<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col font-sans">
    <TripPlanHeader
      :trip-title="tripTitle"
      :trip-date="tripDate"
      :formatted-date="formattedDate"
      :is-edit-mode="isEditMode"
      :total-places-count="allSelectedPlaces.length"
      @update:trip-title="tripTitle = $event"
      @update:trip-date="tripDate = $event"
      @back="handleBack"
      @save="handleSave"
      @delete="handleDelete"
      @edit="enterEditMode"
    />

    <div class="flex-1 flex overflow-hidden relative z-10">
      <TripPlanPanel
        :style="{ width: `${planPanelWidth}px` }"
        :days="days"
        :active-day="activeDay"
        :is-edit-mode="isEditMode"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        @update:active-day="activeDay = $event"
        @search="handleSearchPlaces"
        @remove-place="handleRemovePlace"
        @add-day="handleAddDay"
        @remove-day="handleRemoveDay"
        @update-places="handleUpdatePlaces"
      />

      <div
        class="w-[6px] -ml-[3px] z-30 cursor-col-resize flex items-center justify-center hover:bg-[#9BCCC4] transition-colors opacity-0 hover:opacity-100 active:opacity-100 active:bg-[#9BCCC4]"
        @mousedown="startResize"
      >
        <div class="flex flex-col gap-[2px]">
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
        </div>
      </div>

      <TripSearchPanel
        v-if="isSearchPanelOpen"
        :results="searchResults"
        :is-loading="isSearching"
        @close="closeSearchPanel"
        @add-place="handleAddPlace"
      />

      <div class="flex-1 bg-gray-100 relative z-0">
        <KakaoMap
          class="absolute inset-0"
          :center="{ lat: 37.5443, lng: 127.0557 }"
          :level="5"
          :markers="markerPositions"
        />

        <div class="absolute top-6 right-6 flex flex-col gap-3 z-20">
          <button
            class="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all"
          >
            <Plus class="w-6 h-6 text-black" stroke-width="3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'

import KakaoMap from '@/components/common/KakaoMap.vue'
import TripPlanPanel from '@/components/trip/TripPlanPanel.vue'
import TripPlanHeader from '@/components/trip/TripPlanHeader.vue'
import TripSearchPanel from '@/components/trip/TripSearchPanel.vue' // 신규 패널 import

// Interfaces
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

const route = useRoute()
const router = useRouter()
const isCreating = route.name === 'create-trip'

// Layout State (Resize)
const planPanelWidth = ref(380) // 초기 너비
const isDragging = ref(false)

// State
const isEditMode = ref(isCreating)
const backupData = ref<string>('')
const tripTitle = ref('')
const tripDate = ref('')
const activeDay = ref(1)
const days = ref<DayPlan[]>([])

// Search State (추가됨)
const searchQuery = ref('')
const searchResults = ref<Place[]>([])
const isSearching = ref(false)
const isSearchPanelOpen = ref(false)

// Computed
const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)

const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))

const markerPositions = computed(() =>
  allSelectedPlaces.value.map((p) => ({ lat: p.lat, lng: p.lng, id: p.id })),
)

const startResize = (e: MouseEvent) => {
  isDragging.value = true
  document.body.style.cursor = 'col-resize' // 드래그 중 커서 고정
  document.body.style.userSelect = 'none' // 텍스트 선택 방지

  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isDragging.value) return

  // 최소 280px, 최대 600px 제한
  const newWidth = e.clientX
  if (newWidth >= 280 && newWidth <= 600) {
    planPanelWidth.value = newWidth
  }
}

const stopResize = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
}

const initData = async () => {
  if (isCreating) {
    tripTitle.value = ''
    tripDate.value = new Date().toISOString().split('T')[0]
    days.value = [{ dayNumber: 1, places: [] }]
    isEditMode.value = true
  } else {
    // Mock Data
    tripTitle.value = '성수동 핫플 투어 🔥'
    tripDate.value = '2024-12-25'
    days.value = [
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
        ],
      },
    ]
    if (route.query.edit === 'true') {
      enterEditMode()
    } else {
      isEditMode.value = false
    }
  }
}

// --- 액션 핸들러 ---

// 검색 로직 수정
const handleSearchPlaces = async () => {
  if (!searchQuery.value.trim()) return

  // 패널 열기 및 초기화
  isSearchPanelOpen.value = true
  isSearching.value = true
  searchResults.value = []

  // Mock API Call
  await new Promise((resolve) => setTimeout(resolve, 600))

  searchResults.value = [
    {
      id: Date.now() + 1,
      name: `${searchQuery.value} 감성 카페`,
      address: '서울시 성동구 아차산로 1길',
      category: '카페',
      lat: 37.544,
      lng: 127.056,
    },
    {
      id: Date.now() + 2,
      name: `${searchQuery.value} 파스타`,
      address: '서울시 성동구 서울숲길 15',
      category: '음식점',
      lat: 37.543,
      lng: 127.04,
    },
    {
      id: Date.now() + 3,
      name: `${searchQuery.value} 소품샵`,
      address: '서울시 성동구 연무장길 33',
      category: '쇼핑',
      lat: 37.542,
      lng: 127.05,
    },
  ]
  isSearching.value = false
}

const closeSearchPanel = () => {
  isSearchPanelOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const enterEditMode = () => {
  backupData.value = JSON.stringify({
    title: tripTitle.value,
    date: tripDate.value,
    days: days.value,
  })
  isEditMode.value = true
}

const handleSave = async () => {
  if (!tripTitle.value.trim()) return alert('제목을 입력해주세요.')
  await new Promise((resolve) => setTimeout(resolve, 200))
  alert('저장되었습니다!')
  isEditMode.value = false
  closeSearchPanel() // 저장 시 검색 패널도 닫기
}

const handleBack = () => {
  if (isEditMode.value) {
    if (confirm('작성/수정 중인 내용이 사라집니다. 취소하시겠습니까?')) {
      if (isCreating) {
        router.push('/trips')
      } else {
        const restored = JSON.parse(backupData.value)
        tripTitle.value = restored.title
        tripDate.value = restored.date
        days.value = restored.days
        isEditMode.value = false
        closeSearchPanel()
      }
    }
  } else {
    router.push('/trips')
  }
}

const handleDelete = () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    alert('삭제되었습니다.')
    router.push('/trips')
  }
}

const handleAddPlace = (place: Place) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1) {
    // 중복 체크 (간단히 이름으로)
    const exists = days.value[dayIndex].places.find((p) => p.name === place.name)
    if (!exists) {
      days.value[dayIndex].places.push({ ...place })
    } else {
      alert('이미 추가된 장소입니다.')
    }
  }
  // 추가 후 패널을 닫지 않고 연속 추가 가능하도록 유지
}

const handleRemovePlace = (placeId: number) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1)
    days.value[dayIndex].places = days.value[dayIndex].places.filter((p) => p.id !== placeId)
}

const handleUpdatePlaces = (newPlaces: Place[]) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1) days.value[dayIndex].places = newPlaces
}

const handleAddDay = () => {
  const newDay = days.value.length + 1
  days.value.push({ dayNumber: newDay, places: [] })
  activeDay.value = newDay
}

const handleRemoveDay = (dayNum: number) => {
  if (days.value.length <= 1) return
  if (confirm(`${dayNum}일차를 삭제하시겠습니까?`)) {
    days.value = days.value
      .filter((d) => d.dayNumber !== dayNum)
      .map((d, i) => ({ ...d, dayNumber: i + 1 }))
    if (activeDay.value > 1) activeDay.value--
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
.font-sans {
  font-family: 'Outfit', sans-serif;
}
</style>
