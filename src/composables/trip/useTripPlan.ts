import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place } from './usePlaceSearch'

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

export function useTripPlan() {
  const route = useRoute()
  const router = useRouter()
  const isCreating = route.name === 'create-trip'

  // State
  const isEditMode = ref(isCreating)
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
    if (isCreating) {
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
    await new Promise((r) => setTimeout(r, 200))
    alert('저장되었습니다!')
    isEditMode.value = false
    if (callback) callback()
  }

  const goBack = (callback?: () => void) => {
    if (isEditMode.value) {
      if (confirm('취소하시겠습니까?')) {
        if (isCreating) router.push('/trips')
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
