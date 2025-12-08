import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  Place,
  TripItemSyncRequestDto,
  ItemSyncDto,
  TripItemResponseDto,
  TripStatus,
  TripVisibility,
  TripUpdateRequestDto,
} from '@/types/trip'
import {
  getTripDetail,
  deleteTrip as apiDeleteTrip,
  syncTripItems as apiSyncTripItems,
  updateTrip as apiUpdateTrip,
} from '@/services/trip'

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

// API 응답을 프론트엔드 Place 타입으로 변환하는 헬퍼 함수
const mapTripItemToPlace = (item: TripItemResponseDto): Place => ({
  id: item.id,
  kakaoPlaceId: item.spot.kakaoPlaceId,
  name: item.spot.name,
  address: item.spot.address,
  category: item.spot.category,
  lat: item.spot.lat,
  lng: item.spot.lng,
  url: item.spot.placeUrl,
  memo: item.memo,
})

export function useTripPlan() {
  const route = useRoute()
  const router = useRouter()
  const tripId = ref<number | null>(null)
  const tripStatus = ref<TripStatus | null>(null)
  const tripVisibility = ref<TripVisibility | null>(null)

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
  const reloadTripData = async () => {
    if (!tripId.value) return
    try {
      const tripDetail = await getTripDetail(tripId.value)
      tripTitle.value = tripDetail.title
      tripDate.value = tripDetail.startDate || ''
      tripStatus.value = tripDetail.status
      tripVisibility.value = tripDetail.visibility

      // API 응답을 로컬 상태로 변환
      const maxDay = tripDetail.tripItems.reduce((max, item) => Math.max(max, item.dayNumber), 0)
      const newDays: DayPlan[] = []
      for (let i = 1; i <= maxDay; i++) {
        newDays.push({
          dayNumber: i,
          places: tripDetail.tripItems
            .filter((item) => item.dayNumber === i)
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .filter((item) => item && item.spot) // item 및 item.spot null 체크
            .map(mapTripItemToPlace),
        })
      }
      days.value = newDays.length > 0 ? newDays : [{ dayNumber: 1, places: [] }]
    } catch (error) {
      console.error(`여행 계획 (ID: ${tripId.value}) 상세 정보 불러오기 실패:`, error)
      alert('여행 계획 상세 정보를 불러오는데 실패했습니다.')
      router.push('/trips')
    }
  }

  const initData = async () => {
    if (route.name === 'trip-detail' && route.params.id) {
      tripId.value = Number(route.params.id)
      await reloadTripData()

      isEditMode.value = true
      if (tripVisibility.value === 'PUBLIC') {
        // Changed from tripStatus to tripVisibility
        enterEditMode()
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
    if (!tripId.value) return alert('여행 정보가 올바르게 로드되지 않았습니다.')
    if (!tripTitle.value.trim()) return alert('제목을 입력해주세요.')

    try {
      // 1. 여행 아이템 동기화
      const itemPayload: TripItemSyncRequestDto = {
        days: days.value.map((day) => ({
          dayNumber: day.dayNumber,
          items: day.places.map((place): ItemSyncDto => {
            if (place.id) {
              return { tripItemId: place.id, memo: place.memo }
            } else {
              return {
                spot: {
                  kakaoPlaceId: place.kakaoPlaceId,
                  name: place.name,
                  address: place.address,
                  category: place.category,
                  lat: place.lat,
                  lng: place.lng,
                  placeUrl: place.url || '',
                },
                memo: place.memo,
              }
            }
          }),
        })),
      }
      await apiSyncTripItems(tripId.value, itemPayload)

      // 2. 여행 기본 정보 (제목, 날짜, 상태, 공개 여부) 업데이트
      const updatePayload: TripUpdateRequestDto = {
        title: tripTitle.value,
        startDate: tripDate.value || undefined,
        endDate: undefined, // Assuming endDate is not managed by frontend yet
        status: 'PLANNED', // User wants to save as PLANNED
        visibility: 'PUBLIC', // User wants to save as PUBLIC
      }
      await apiUpdateTrip(tripId.value, updatePayload)

      // 3. 데이터를 다시 로드하여 UI를 동기화합니다.
      await reloadTripData()

      alert('저장되었습니다!')
      isEditMode.value = false
      if (callback) callback()
    } catch (error) {
      console.error('여행 계획 저장 실패:', error)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const goBack = async (callback?: () => void) => {
    if (isEditMode.value) {
      if (confirm('작성을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
        if (tripStatus.value === 'DRAFT' && tripId.value) {
          try {
            await apiDeleteTrip(tripId.value)
            router.push('/trips')
          } catch (error) {
            console.error(`여행 계획 (ID: ${tripId.value}) 삭제 실패:`, error)
            alert('임시 여행 계획 삭제에 실패했습니다.')
          }
        } else if (backupData.value) {
          const restored = JSON.parse(backupData.value)
          tripTitle.value = restored.title
          tripDate.value = restored.date
          days.value = restored.days
          isEditMode.value = false
          if (callback) callback()
        } else {
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

  // --- 로컬 상태 변경 함수들 ---

  const addPlace = (place: Place): Place | undefined => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (!day) {
      alert('유효하지 않은 일차입니다.')
      return
    }

    const isDuplicate = day.places.some((p) => p.kakaoPlaceId === place.kakaoPlaceId)
    if (isDuplicate) {
      alert('이미 추가된 장소입니다.')
      return
    }

    const newPlace = { ...place, id: undefined, memo: '' }
    day.places.push(newPlace)
    return newPlace
  }

  const removePlace = (placeToRemove: Place) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day) {
      day.places = day.places.filter((p) => {
        // id가 있으면 id로, 없으면 kakaoPlaceId로 비교하여 삭제
        if (p.id && placeToRemove.id) {
          return p.id !== placeToRemove.id
        }
        return p.kakaoPlaceId !== placeToRemove.kakaoPlaceId
      })
    }
  }

  const updatePlaces = (newPlaces: Place[]) => {
    const day = days.value.find((d) => d.dayNumber === activeDay.value)
    if (day) {
      day.places = newPlaces
    }
  }

  const addDay = () => {
    days.value.push({ dayNumber: days.value.length + 1, places: [] })
    activeDay.value = days.value.length
  }

  const removeDay = (dayNum: number) => {
    if (days.value.length <= 1) return
    if (confirm('일차를 삭제하시겠습니까? 해당 일차의 모든 장소가 삭제됩니다.')) {
      days.value = days.value.filter((d) => d.dayNumber !== dayNum)
      // 남은 day들의 dayNumber를 재정렬
      days.value.forEach((day, index) => {
        day.dayNumber = index + 1
      })
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
    tripVisibility,
  }
}
