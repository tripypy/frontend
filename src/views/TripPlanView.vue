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
        :style="{ width: `${panelWidth}px` }"
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
import TripSearchPanel from '@/components/trip/TripSearchPanel.vue'
import { useResizablePanel } from '@/composables/useResizablePanel'

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

// State
const isEditMode = ref(isCreating)
const backupData = ref<string>('')
const tripTitle = ref('')
const tripDate = ref('')
const activeDay = ref(1)
const days = ref<DayPlan[]>([])

// Search State
const searchQuery = ref('')
const searchResults = ref<Place[]>([])
const isSearching = ref(false)
const isSearchPanelOpen = ref(false)

// Computed
const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)

const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))

// [수정됨] 마커 표시 로직: 선택된 장소 + 검색 결과 장소 모두 표시
const markerPositions = computed(() => {
  // 1. 이미 일정에 추가된 장소들
  const selectedMarkers = allSelectedPlaces.value.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    id: p.id,
  }))

  // 2. 현재 검색된 결과 장소들 (검색 패널이 열려있을 때만)
  let searchMarkers: any[] = []
  if (isSearchPanelOpen.value && searchResults.value.length > 0) {
    searchMarkers = searchResults.value.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id,
    }))
  }

  // 두 배열 합치기
  return [...selectedMarkers, ...searchMarkers]
})

const { width: panelWidth, startResize } = useResizablePanel({
  initialWidth: 380,
  minWidth: 280,
  maxWidth: 600,
})

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

// [수정됨] 실제 카카오 키워드 검색 API 호출
const handleSearchPlaces = () => {
  // 1. 검색어 유효성 체크
  if (!searchQuery.value.trim()) return

  // 2. 카카오 객체 확인 (안전장치)
  if (!(window as any).kakao || !(window as any).kakao.maps) {
    alert('카카오맵 SDK가 로드되지 않았습니다.')
    return
  }

  // 3. 상태 초기화
  isSearchPanelOpen.value = true
  isSearching.value = true
  searchResults.value = []

  // 4. 장소 검색 객체 생성
  const ps = new (window as any).kakao.maps.services.Places()

  // 5. 검색 실행
  ps.keywordSearch(searchQuery.value, (data: any[], status: any) => {
    isSearching.value = false

    if (status === (window as any).kakao.maps.services.Status.OK) {
      // 6. API 결과를 내 앱의 Place 인터페이스에 맞게 변환
      searchResults.value = data.map((item: any) => ({
        id: Number(item.id),
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        category: item.category_group_name || '기타',
        lat: Number(item.y), // API는 y가 위도(latitude)
        lng: Number(item.x), // API는 x가 경도(longitude)
      }))
    } else if (status === (window as any).kakao.maps.services.Status.ZERO_RESULT) {
      // 검색 결과 없음
      searchResults.value = []
    } else if (status === (window as any).kakao.maps.services.Status.ERROR) {
      alert('검색 중 오류가 발생했습니다.')
    }
  })
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
  closeSearchPanel()
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
    const exists = days.value[dayIndex].places.find((p) => p.name === place.name)
    if (!exists) {
      days.value[dayIndex].places.push({ ...place })
    } else {
      alert('이미 추가된 장소입니다.')
    }
  }
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
