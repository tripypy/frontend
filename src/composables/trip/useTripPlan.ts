import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place, TripDetailResponseDto } from '@/types/trip'
import { getTripDetail, deleteTrip as apiDeleteTrip } from '@/services/trip'

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

export function useTripPlan() {
  const route = useRoute()
  const router = useRouter()
  const tripId = ref<number | null>(null)
  const tripStatus = ref<TripDetailResponseDto['status'] | null>(null)

  // State
  const isEditMode = ref(false)
  const backupData = ref('')
  const tripTitle = ref('')
  const tripDate = ref('')
  const activeDay = ref(1)
  const days = ref<DayPlan[]>([])

  // Computed
  const formattedDate = computed(() =>
    tripDate.value ? new Date(tripDate.value).toLocaleDateString() : '날짜 미정',
  )
  const allSelectedPlaces = computed(() => days.value.flatMap((d) => d.places))

  // Methods
  const initData = async () => {
    // 'create-trip' 경로로 직접 접근 시, 새 여행 생성을 TripView에서 처리하므로 로직을 단순화합니다.
    // 이 경로는 현재 사용되지 않을 것으로 예상되지만, 방어적으로 남겨둡니다.
    if (route.name === 'create-trip') {
      tripTitle.value = ''
      tripDate.value = new Date().toISOString().split('T')[0]
      days.value = [{ dayNumber: 1, places: [] }]
      isEditMode.value = true
      tripStatus.value = 'DRAFT' // 새 여행이므로 DRAFT로 설정
      return
    }

    if (route.name === 'trip-detail' && route.params.id) {
      tripId.value = Number(route.params.id)
      try {
        const tripDetail = await getTripDetail(tripId.value)
        tripTitle.value = tripDetail.title
        tripDate.value = tripDetail.startDate || ''
        tripStatus.value = tripDetail.status
        isEditMode.value = true // 상세 페이지 진입 시 항상 편집 모드

        // 백업 데이터는 PUBLIC 상태의 여행을 편집 시작할 때만 생성
        if (tripDetail.status === 'PUBLIC') {
          enterEditMode()
        }

        // API에서 받은 tripItems를 DayPlan[] 형태로 변환
        const maxDay = tripDetail.tripItems.reduce((max, item) => Math.max(max, item.dayNumber), 0)
        const newDays: DayPlan[] = []
        for (let i = 1; i <= maxDay; i++) {
          newDays.push({
            dayNumber: i,
            places: tripDetail.tripItems
              .filter((item) => item.dayNumber === i)
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item) => ({
                id: item.id,
                name: item.spot.name,
                address: item.spot.address,
                category: item.spot.category,
                lat: item.spot.lat,
                lng: item.spot.lng,
                url: item.spot.placeUrl,
              })),
          })
        }
        days.value = newDays.length > 0 ? newDays : [{ dayNumber: 1, places: [] }]
      } catch (error) {
        console.error(`여행 계획 (ID: ${tripId.value}) 상세 정보 불러오기 실패:`, error)
        alert('여행 계획 상세 정보를 불러오는데 실패했습니다.')
        router.push('/trips')
      }
    }
  }

  const enterEditMode = () => {
    backupData.value = JSON.stringify({
      title: tripTitle.value,
      date: tripDate.value,
      days: days.value,
    })
    isEditMode.value = true
  }

  const saveTrip = async (callback?: () => void) => {
    if (!tripTitle.value.trim()) return alert('제목을 입력해주세요.')
    // TODO: PUT /api/trips/{tripId} API 연동 필요
    await new Promise((r) => setTimeout(r, 200))
    alert('저장되었습니다!')
    tripStatus.value = 'PUBLIC' // 저장 후 상태를 PUBLIC으로 변경
    isEditMode.value = false
    if (callback) callback()
  }

  const goBack = async (callback?: () => void) => {
    if (isEditMode.value) {
      if (confirm('작성을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
        // DRAFT 상태의 여행 계획(새로 생성된 계획)을 취소할 경우 삭제 API 호출
        if (tripStatus.value === 'DRAFT' && tripId.value) {
          try {
            await apiDeleteTrip(tripId.value)
            router.push('/trips')
          } catch (error) {
            console.error(`여행 계획 (ID: ${tripId.value}) 삭제 실패:`, error)
            alert('임시 여행 계획 삭제에 실패했습니다.')
          }
        } else if (backupData.value) {
          // PUBLIC 상태의 여행 계획 편집을 취소할 경우, 백업 데이터로 복원
          const restored = JSON.parse(backupData.value)
          tripTitle.value = restored.title
          tripDate.value = restored.date
          days.value = restored.days
          isEditMode.value = false
          if (callback) callback()
        } else {
          // 백업 데이터가 없는 경우 (예: DRAFT 상태에서 새로고침 후 취소)는 목록으로 이동
          router.push('/trips')
        }
      }
    } else {
      router.push('/trips')
    }
  }

  const deleteTrip = async () => {
    if (tripId.value && confirm('정말 삭제하시겠습니까?')) {
      try {
        await apiDeleteTrip(tripId.value)
        alert('삭제되었습니다.')
        router.push('/trips')
      } catch (error) {
        console.error(`여행 계획 (ID: ${tripId.value}) 삭제 실패:`, error)
        alert('여행 계획 삭제에 실패했습니다.')
      }
    }
  }

  // ... (일정 관리 메서드들은 동일)
  const addPlace = (place: Place) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day && !day.places.find((p) => p.id === place.id)) {
      day.places.push({ ...place })
    } else {
      alert('이미 추가된 장소입니다.')
    }
  }

  const removePlace = (id: number) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day) day.places = day.places.filter((p) => p.id !== id)
  }

  const updatePlaces = (newPlaces: Place[]) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day) day.places = newPlaces
  }

  const addDay = () => {
    days.value.push({ dayNumber: days.value.length + 1, places: [] })
    activeDay.value = days.value.length
  }

  const removeDay = (dayNum: number) => {
    if (days.value.length <= 1) return
    if (confirm('일차를 삭제하시겠습니까?')) {
      days.value = days.value
        .filter((d) => d.dayNumber !== dayNum)
        .map((d, i) => ({ ...d, dayNumber: i + 1 }))
      if (activeDay.value >= dayNum && activeDay.value > 1) {
        activeDay.value--
      }
    }
  }

  onMounted(() => initData())

  return {
    tripId,
    isEditMode,
    tripTitle,
    tripDate,
    activeDay,
    days,
    formattedDate,
    allSelectedPlaces,
    enterEditMode,
    saveTrip,
    goBack,
    deleteTrip,
    addPlace,
    removePlace,
    updatePlaces,
    addDay,
    removeDay,
  }
}
