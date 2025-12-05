<template>
  <div class="min-h-screen bg-[#F5F5F5] font-sans">
    <TravelNavbar :current-page="'trips'" @navigate="handleNavigate" />

    <div class="pt-40 max-w-[1440px] mx-auto px-4 md:px-[70px] pb-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 class="text-5xl font-black tracking-tighter uppercase mb-2 font-sans text-black">
            My <span class="italic text-[#9BCCC4]">Trips</span>
          </h1>
          <p class="text-sm font-bold text-gray-600">나만의 여행 계획을 만들고 관리하세요</p>
        </div>

        <button
          @click="handleCreate"
          class="flex items-center justify-center gap-3 px-6 py-4 bg-[#F9CA6B] border-[3px] border-black rounded-2xl font-black text-sm tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase w-full md:w-auto focus:outline-none"
        >
          <Plus class="w-5 h-5" stroke-width="3" />
          새로운 여행 계획 만들기
        </button>
      </div>

      <div class="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all text-xs font-bold whitespace-nowrap focus:outline-none border-[2px] border-transparent',
            activeTab === tab.id
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200',
          ]"
        >
          {{ tab.label }} {{ getCount(tab.id) }}
        </button>
      </div>

      <div v-if="activeTab === 'completed'" class="space-y-12">
        <div v-for="(group, month) in groupedCompletedTrips" :key="month">
          <div class="mb-6">
            <h2 class="text-5xl font-black tracking-tighter uppercase font-sans text-black">
              {{ formatMonth(month as string).year }}.<span class="italic text-[#E88555]">{{
                formatMonth(month as string).month
              }}</span>
            </h2>
            <div class="h-0.5 w-16 bg-black mt-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TripCard
              v-for="trip in group"
              :key="trip.id"
              :trip="trip"
              @click="handleCardClick(trip.id)"
              @open-modal="handleOpenModal"
            />
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TripCard
          v-for="trip in displayTrips"
          :key="trip.id"
          :trip="trip"
          @click="handleCardClick(trip.id)"
          @open-modal="handleOpenModal"
        />
      </div>
    </div>

    <TripDetailModal
      v-if="selectedTrip"
      :trip="selectedTrip"
      @close="selectedTrip = null"
      @edit="handleEditFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import TripCard from '@/components/trip/TripCard.vue'
import TripDetailModal from '@/components/modal/TripDetailModal.vue'

// ★ 목업 데이터 (실제로는 API 혹은 Pinia store에서 가져옴)
import { initialTrips } from '@/data/trips'

interface Trip {
  id: number
  title: string
  spots: number
  status: string
  tags?: string[]
  spotPreviews: { name: string }[]
  completedDate?: string
}

const router = useRouter()
const activeTab = ref<'all' | 'planning' | 'completed' | 'saved'>('all')
const tripsList = ref<Trip[]>(initialTrips)
const selectedTrip = ref<any>(null)

// 탭 필터링 로직
const planningTrips = computed(() => tripsList.value.filter((t) => t.status === '계획중'))
const completedTrips = computed(() => tripsList.value.filter((t) => t.status === '완료'))
const savedTrips = computed(() => tripsList.value.filter((t) => t.status === '스크랩'))

const displayTrips = computed(() => {
  if (activeTab.value === 'planning') return planningTrips.value
  if (activeTab.value === 'completed') return completedTrips.value
  if (activeTab.value === 'saved') return savedTrips.value
  return tripsList.value
})

const tabs = [
  { id: 'all', label: '전체' },
  { id: 'planning', label: '계획중' },
  { id: 'completed', label: '완료' },
  { id: 'saved', label: '스크랩' },
]

const getCount = (tabId: string) => {
  if (tabId === 'all') return tripsList.value.length
  if (tabId === 'planning') return planningTrips.value.length
  if (tabId === 'completed') return completedTrips.value.length
  if (tabId === 'saved') return savedTrips.value.length
  return 0
}

// 완료된 여행 날짜 그룹핑
const groupedCompletedTrips = computed(() => {
  const groups: Record<string, Trip[]> = {}
  completedTrips.value.forEach((trip) => {
    if (trip.completedDate) {
      const monthKey = trip.completedDate.substring(0, 7)
      if (!groups[monthKey]) groups[monthKey] = []
      groups[monthKey].push(trip)
    }
  })
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .reduce(
      (acc, key) => {
        acc[key] = groups[key]
        return acc
      },
      {} as Record<string, Trip[]>,
    )
})

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('.')
  return { year, month }
}

// --- 핸들러 함수들 ---

// 1. 새 여행 만들기 -> /create-trip 이동
const handleCreate = () => {
  router.push('/create-trip')
}

// 2. 카드 클릭 시 -> /trips/:id (상세 보기 모드) 이동
const handleCardClick = (id: number) => {
  router.push(`/trips/${id}`)
}

// 3. 모달 열기 (TripCard에서 emit된 이벤트)
const handleOpenModal = (tripId: number) => {
  const trip = tripsList.value.find((t) => t.id === tripId)
  if (trip) {
    // 모달용 데이터 매핑
    selectedTrip.value = {
      ...trip,
      duration: '반나절', // Mock
      description: trip.spotPreviews.map((s) => s.name).join(' → '),
      views: 1240,
      imageUrl: '',
    }
  }
}

// 4. 모달에서 수정 버튼 클릭 시 -> /trips/:id?edit=true (바로 수정 모드)
const handleEditFromModal = (trip: any) => {
  router.push(`/trips/${trip.id}?edit=true`)
  selectedTrip.value = null
}

// 5. 네비게이션바 처리
const handleNavigate = (page: string) => {
  if (page === 'create-trip') handleCreate()
  else if (page === 'trips') router.push('/trips')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
.font-sans {
  font-family: 'Outfit', sans-serif;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
