<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar :current-page="'trips'" @navigate="handleNavigate" />

    <div class="pt-40 max-w-[1440px] mx-auto px-4 md:px-[70px] pb-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 class="text-5xl font-black tracking-tighter uppercase mb-2 font-sans">
            My <span class="italic text-[#9BCCC4]">Trips</span>
          </h1>
          <p class="text-sm font-bold text-gray-600">나만의 여행 계획을 만들고 관리하세요</p>
        </div>

        <button
          @click="handleNavigate('create-trip')"
          class="flex items-center justify-center gap-3 px-6 py-4 bg-[#F9CA6B] border-[3px] border-[#2C2C2C] rounded-2xl font-black text-sm tracking-tight shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:shadow-[6px_6px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase w-full md:w-auto focus:outline-none"
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
            'px-3 py-1.5 rounded-lg transition-all text-xs font-bold whitespace-nowrap focus:outline-none',
            activeTab === tab.id
              ? 'bg-[#2C2C2C] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100',
          ]"
        >
          {{ tab.label }} {{ getCount(tab.id) }}
        </button>
      </div>

      <div v-if="activeTab === 'completed'" class="space-y-12">
        <div v-for="(group, month) in groupedCompletedTrips" :key="month">
          <div class="mb-6">
            <h2 class="text-5xl font-black tracking-tighter uppercase font-sans">
              {{ formatMonth(month as string).year }}.<span class="italic text-[#E88555]">{{
                formatMonth(month as string).month
              }}</span>
            </h2>
            <div class="h-0.5 w-16 bg-[#2C2C2C] mt-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TripCard
              v-for="trip in group"
              :key="trip.id"
              :trip="trip"
              @open-modal="handleOpenModal"
              @navigate="handleNavigate"
            />
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TripCard
          v-for="trip in displayTrips"
          :key="trip.id"
          :trip="trip"
          @open-modal="handleOpenModal"
          @navigate="handleNavigate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import TripCard from '@/components/trip/TripCard.vue'
import { initialTrips } from '@/data/trips'
import { useRouter } from 'vue-router'

// 1. 타입 정의 (명시적으로 선언하여 오류 방지)
interface Trip {
  id: number
  title: string
  spots: number
  status: string
  tags?: string[]
  spotPreviews: { name: string }[]
  completedDate?: string
}

// 상태 관리
const activeTab = ref<'all' | 'planning' | 'completed' | 'saved'>('all')
// initialTrips를 Trip[] 타입으로 단언
const tripsList = ref<Trip[]>(initialTrips)

// 필터링된 데이터
const planningTrips = computed(() => tripsList.value.filter((t) => t.status === '계획중'))
const completedTrips = computed(() => tripsList.value.filter((t) => t.status === '완료'))
const savedTrips = computed(() => tripsList.value.filter((t) => t.status === '스크랩'))

const displayTrips = computed(() => {
  if (activeTab.value === 'planning') return planningTrips.value
  if (activeTab.value === 'completed') return completedTrips.value
  if (activeTab.value === 'saved') return savedTrips.value
  return tripsList.value
})

// 탭 정보
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

// 완료된 여행 월별 그룹핑
const groupedCompletedTrips = computed(() => {
  // Record<string, Trip[]> 타입을 명시
  const groups: Record<string, Trip[]> = {}

  completedTrips.value.forEach((trip) => {
    if (trip.completedDate) {
      const monthKey = trip.completedDate.substring(0, 7)
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(trip)
    }
  })

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .reduce(
      (acc, key) => {
        acc[key] = groups[key]!
        return acc
      },
      {} as Record<string, Trip[]>,
    )
})

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('.')
  return { year, month }
}

// 핸들러
const router = useRouter()
const handleNavigate = (page: string) => {
  if (page === 'main') {
    router.push('/')
  } else if (page === 'trips') {
    router.push('/trips')
  } else if (page === 'search') {
    console.log('Search page not implemented')
  }
}

const handleOpenModal = (tripId: number) => {
  console.log(`Open modal for trip: ${tripId}`)
}
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
