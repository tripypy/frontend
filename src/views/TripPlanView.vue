<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col font-sans">
    <TripHeader
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
        :days="days"
        :active-day="activeDay"
        :is-edit-mode="isEditMode"
        :search-query="searchQuery"
        :search-results="searchResults"
        @update:search-query="searchQuery = $event"
        @update:active-day="activeDay = $event"
        @add-place="handleAddPlace"
        @remove-place="handleRemovePlace"
        @add-day="handleAddDay"
        @remove-day="handleRemoveDay"
        @update-places="handleUpdatePlaces"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'

import KakaoMap from '@/components/common/KakaoMap.vue'
import TripPlanPanel from '@/components/trip/TripPlanPanel.vue'
import TripHeader from '@/components/trip/TripHeader.vue'

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

// 현재 페이지 모드 판단
const isCreating = route.name === 'create-trip'

// State
const isEditMode = ref(isCreating) // 생성 모드면 true, 아니면 false로 시작
const backupData = ref<string>('')

const tripTitle = ref('')
const tripDate = ref('')
const activeDay = ref(1)
const days = ref<DayPlan[]>([])
const searchQuery = ref('')
const searchResults = ref<Place[]>([])

// Computed
const formattedDate = computed(() =>
  tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
)
const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))
const markerPositions = computed(() =>
  allSelectedPlaces.value.map((p) => ({ lat: p.lat, lng: p.lng, id: p.id })),
)

// --- 초기화 로직 ---
const initData = async () => {
  if (isCreating) {
    // [CASE 1] 새 여행 만들기 (/create-trip)
    tripTitle.value = ''
    tripDate.value = new Date().toISOString().split('T')[0]
    days.value = [{ dayNumber: 1, places: [] }]
    // 생성 모드는 시작부터 편집 가능
    isEditMode.value = true
  } else {
    // [CASE 2] 기존 여행 보기 (/trips/:id)
    // TODO: const id = route.params.id; await fetchTrip(id);

    // Mock Data 로드
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
          {
            id: 2,
            name: '소문난감자탕',
            address: '서울시 성동구 연무장길 45',
            category: '음식점',
            lat: 37.5445,
            lng: 127.0559,
          },
        ],
      },
    ]

    // URL 쿼리에 ?edit=true가 있으면 바로 편집 모드 실행
    if (route.query.edit === 'true') {
      enterEditMode()
    } else {
      isEditMode.value = false
    }
  }
}

// --- 액션 핸들러 ---

// 검색 (Mock)
const handleSearchPlaces = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  // 짧은 딜레이로 자연스럽게
  await new Promise((resolve) => setTimeout(resolve, 100))
  searchResults.value = [
    {
      id: 101,
      name: `${searchQuery.value} 카페`,
      address: '서울시 성동구 아차산로',
      category: '카페',
      lat: 37.544,
      lng: 127.056,
    },
    {
      id: 102,
      name: `${searchQuery.value} 공원`,
      address: '서울시 성동구 서울숲',
      category: '공원',
      lat: 37.543,
      lng: 127.04,
    },
  ]
}

// 편집 모드 진입 (백업 수행)
const enterEditMode = () => {
  backupData.value = JSON.stringify({
    title: tripTitle.value,
    date: tripDate.value,
    days: days.value,
  })
  isEditMode.value = true
}

// 저장 (상태만 변경, 페이지 이동 X)
const handleSave = async () => {
  if (!tripTitle.value.trim()) return alert('제목을 입력해주세요.')

  await new Promise((resolve) => setTimeout(resolve, 200))
  alert('저장되었습니다!')
  isEditMode.value = false

  // 생성 모드였다면 저장 후에는 상세 보기 모드로 전환된 것처럼 URL 변경 (선택사항)
  if (isCreating) {
    // router.replace(`/trips/999`)
  }
}

// 뒤로가기 / 취소
const handleBack = () => {
  if (isEditMode.value) {
    if (confirm('작성/수정 중인 내용이 사라집니다. 취소하시겠습니까?')) {
      if (isCreating) {
        // 생성 중 취소 -> 목록으로
        router.push('/trips')
      } else {
        // 수정 중 취소 -> 데이터 원복 후 조회 모드
        const restored = JSON.parse(backupData.value)
        tripTitle.value = restored.title
        tripDate.value = restored.date
        days.value = restored.days
        isEditMode.value = false
      }
    }
  } else {
    // 조회 중 뒤로가기 -> 목록으로
    router.push('/trips')
  }
}

// 삭제
const handleDelete = () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    // await deleteTripAPI(...)
    alert('삭제되었습니다.')
    router.push('/trips')
  }
}

// --- 일정 관리 로직 ---
const handleAddPlace = (place: Place) => {
  const dayIndex = days.value.findIndex((d) => d.dayNumber === activeDay.value)
  if (dayIndex !== -1 && !days.value[dayIndex].places.find((p) => p.id === place.id)) {
    days.value[dayIndex].places.push(place)
  }
  searchQuery.value = ''
  searchResults.value = []
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

// Lifecycle
onMounted(() => {
  initData()
})

watch(searchQuery, (newVal) => {
  if (newVal) handleSearchPlaces()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
.font-sans {
  font-family: 'Outfit', sans-serif;
}
</style>
