import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place } from '@/types/trip'
import { getTripDetail } from '@/services/trip'

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

export function useTripPlan() {
  const route = useRoute()
  const router = useRouter()
  const tripId = ref<number | null>(null) // tripId 상태 추가
  const isCreating = computed(() => route.name === 'create-trip') // isCreating을 computed로 변경

  // State
  const isEditMode = ref(false) // 초기값 false로 변경
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
    if (route.name === 'trip-detail') {
      // 기존 여행 계획 상세 조회 및 편집 모드 진입
      tripId.value = Number(route.params.id)
      try {
        const tripDetail = await getTripDetail(tripId.value)
        tripTitle.value = tripDetail.title
        tripDate.value = tripDetail.startDate || '' // startDate가 없으면 빈 문자열로 설정
        // tripItems를 days 형태로 변환 (현재는 dayNumber가 1로 고정되어 있다고 가정)
        // TODO: 실제 tripItems의 dayNumber에 따라 days 배열을 구성하는 로직 필요
        days.value = [
          {
            dayNumber: 1,
            places: tripDetail.tripItems.map((item) => ({
              id: item.id, // tripItemId를 id로 변경
              name: item.spot.name,
              address: item.spot.address,
              category: item.spot.category,
              lat: item.spot.lat,
              lng: item.spot.lng,
              phone: undefined, // API 응답에 phone이 없으므로 undefined
              url: item.spot.placeUrl,
            })),
          },
        ]
        isEditMode.value = true // 편집 모드로 바로 진입
      } catch (error) {
        console.error(`여행 계획 (ID: ${tripId.value}) 상세 정보 불러오기 실패:`, error)
        alert('여행 계획 상세 정보를 불러오는데 실패했습니다.')
        router.push('/trips') // 실패 시 목록 페이지로 리다이렉트
      }
    } else if (isCreating.value) {
      // /create-trip 경로로 직접 접근한 경우 (현재는 TripView에서 생성 후 이동하므로 이 경로는 사용되지 않을 수 있음)
      tripTitle.value = ''
      tripDate.value = new Date().toISOString().split('T')[0]
      days.value = [{ dayNumber: 1, places: [] }]
      isEditMode.value = true
    } else {
      // Mock Data Load (나중에 API로 대체될 부분)
      tripTitle.value = '성수동 핫플 투어 🔥'
      tripDate.value = '2024-12-25'
      days.value = [
        {
          dayNumber: 1,
          places: [
            {
              id: 1,
              name: '대림창고',
              address: '서울시 성동구...',
              category: '카페',
              lat: 37.5443,
              lng: 127.0557,
            },
          ],
        },
      ]
      if (route.query.edit === 'true') enterEditMode()
      else isEditMode.value = false
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

    // 이제 여행 계획 생성은 TripView에서 처리하므로, 여기서는 항상 수정 모드로 간주합니다.
    await new Promise((r) => setTimeout(r, 200))
    alert('저장되었습니다!')
    isEditMode.value = false
    if (callback) callback()
  }

  const goBack = (callback?: () => void) => {
    if (isEditMode.value) {
      if (confirm('취소하시겠습니까?')) {
        if (isCreating.value) router.push('/trips')
        else {
          const restored = JSON.parse(backupData.value)
          tripTitle.value = restored.title
          tripDate.value = restored.date
          days.value = restored.days
          isEditMode.value = false
          if (callback) callback()
        }
      }
    } else {
      router.push('/trips')
    }
  }

  const deleteTrip = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      alert('삭제되었습니다.')
      router.push('/trips')
    }
  }

  // 일정 관리 (Place CRUD)
  const addPlace = (place: Place) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day && !day.places.find((p) => p.name === place.name)) {
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
    if (confirm('삭제하시겠습니까?')) {
      days.value = days.value
        .filter((d) => d.dayNumber !== dayNum)
        .map((d, i) => ({ ...d, dayNumber: i + 1 }))
      if (activeDay.value > 1) activeDay.value--
    }
  }

  onMounted(() => initData())

  return {
    tripId, // tripId 반환
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
