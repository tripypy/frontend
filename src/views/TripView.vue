<template>
  <div class="min-h-screen bg-[#F5F5F5] font-sans">
    <TravelNavbar :current-page="'trips'" @navigate="handleNavigate" />

    <div class="pt-40 max-w-[1440px] mx-auto px-4 md:px-[70px] pb-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 class="text-5xl font-black tracking-tighter uppercase mb-2 font-sans text-black">
            My <span class="ml-2 text-[#9BCCC4]">Trips</span>
          </h1>
          <p class="text-sm font-bold text-gray-600">나만의 여행 계획을 만들고 관리하세요</p>
        </div>

        <button
          @click="handleCreateNewTrip"
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
          @click="activeTab = tab.id"
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

      <div v-if="activeTab === TripStatus.COMPLETED" class="space-y-12">
        <div v-for="(group, month) in groupedCompletedTrips" :key="month">
          <div class="mb-6">
            <h2 class="text-5xl font-black tracking-tighter uppercase font-sans text-black">
              {{ formatMonth(month as string).year }}.<span class="text-[#E88555]">{{
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
              @click="handleOpenModal(trip.id)"
              @open-modal="handleOpenModal"
              @refresh="fetchTrips"
            />
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TripCard
          v-for="trip in displayTrips"
          :key="trip.id"
          :trip="trip"
          @click="handleOpenModal(trip.id)"
          @open-modal="handleOpenModal"
          @refresh="fetchTrips"
        />
      </div>
    </div>

    <TripDetailModal
      v-if="selectedTrip"
      :trip="selectedTrip"
      @close="selectedTrip = null"
      @edit="handleEditFromModal"
      @write="handleWriteLogFromModal"
      @edit-log="handleEditLogFromModal"
      @refresh="fetchTrips"
    />

    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useNavigate } from '@/composables/common/useNavagation'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import TripCard from '@/components/trip/TripCard.vue'
import TripDetailModal from '@/components/modal/TripDetailModal.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import { useRouter } from 'vue-router'
import { createTrip, getMyTrips, getTripDetail } from '@/apis/trip/index'
import type { TripResponseDto, TripDetailResponseDto, TripItemResponseDto } from '@/apis/trip/types'
import { TripStatus } from '@/types/common'
import type { TripLogDetail } from '@/types/trip/trip.model'

const { handleNavigate } = useNavigate()
const router = useRouter()

const activeTab = ref<TripStatus | 'all'>('all')
const tripsList = ref<TripResponseDto[]>([])

// 데이터 조회
const fetchTrips = async () => {
  try {
    const response = await getMyTrips()
    tripsList.value = response
  } catch (error) {
    console.error('내 여행 목록 조회 실패:', error)
    // alert('내 여행 목록 조회에 실패했습니다.') // 필요시 주석 해제
  }
}

onMounted(fetchTrips)

const selectedTrip = ref<TripDetailResponseDto | null>(null)

// 새로운 여행 계획 생성 핸들러
const handleCreateNewTrip = async () => {
  try {
    const newTrip = await createTrip()
    handleNavigate('trip-edit', { id: newTrip.id })
  } catch (error) {
    console.error('여행 계획 생성 실패:', error)
    alert('여행 계획 생성에 실패했습니다.')
  }
}

// 탭 필터링 로직
const planningTrips = computed(() => tripsList.value.filter((t) => t.status === TripStatus.PLANNED))
const completedTrips = computed(() => tripsList.value.filter((t) => t.status === TripStatus.COMPLETED))

const displayTrips = computed(() => {
  if (activeTab.value === TripStatus.PLANNED) return planningTrips.value
  if (activeTab.value === TripStatus.COMPLETED) return completedTrips.value
  return tripsList.value
})

// [수정됨] 스크랩 탭 제거
const tabs: { id: TripStatus | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: TripStatus.PLANNED, label: '계획중' },
  { id: TripStatus.COMPLETED, label: '완료' },
]

const getCount = (tabId: TripStatus | 'all') => {
  if (tabId === 'all') return tripsList.value.length
  if (tabId === TripStatus.PLANNED) return planningTrips.value.length
  if (tabId === TripStatus.COMPLETED) return completedTrips.value.length
  return 0
}

const groupedCompletedTrips = computed(() => {
  const groups: Record<string, TripResponseDto[]> = {}
  completedTrips.value.forEach((trip) => {
    if (trip.startDate) {
      const monthKey = trip.startDate.substring(0, 7)
      if (!groups[monthKey]) groups[monthKey] = []
      groups[monthKey]!.push(trip)
    }
  })
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .reduce(
      (acc, key) => {
        acc[key] = groups[key]
        return acc
      },
      {} as Record<string, TripResponseDto[]>,
    )
})

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  return { year, month }
}

// --- 핸들러 함수들 ---

// 1. 모달 열기 로직
const handleOpenModal = async (tripId: number) => {
  try {
    const detail = await getTripDetail(tripId)
    selectedTrip.value = {
      ...detail,
      description:
        detail.tripItems && detail.tripItems.length > 0
          ? detail.tripItems.map((item : TripItemResponseDto) => item.spot.name).join(' → ')
          : '장소 없음',
    }
  } catch (error) {
    console.error(`여행 상세 조회 실패 (ID: ${tripId}):`, error)
    alert('여행 상세 정보를 불러오는데 실패했습니다.')
    selectedTrip.value = null
  }
}

// 2. TripPlanView로 이동
const handleEditFromModal = (trip: TripDetailResponseDto) => {
  selectedTrip.value = null
  handleNavigate('trip-edit', { id: trip.id })
}

// 3. 로그 작성 이동
const handleWriteLogFromModal = (trip: TripDetailResponseDto) => {
  selectedTrip.value = null
  router.push({
    name: 'log-write',
    params: { tripId: trip.id }
  })
}

// 4. 로그 수정 이동
const handleEditLogFromModal = (tripLog: TripLogDetail) => {
  selectedTrip.value = null
  if (tripLog.logId){
    router.push({ name: 'log-edit', params: { logId: tripLog.logId}})
  }
}
</script>

<style scoped>
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
