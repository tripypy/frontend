// src/composables/trip/useMapInteraction.ts
import { ref, computed, type Ref } from 'vue'
import type { Place } from '@/types/trip'

// 필요한 외부 데이터나 함수들의 타입을 정의
interface UseMapInteractionProps {
  searchResults: Ref<Place[]>
  allSelectedPlaces: Ref<Place[]>
  searchQuery: Ref<string>
  isSearchPanelOpen: Ref<boolean>
  searchPlaces: (mapInstance?: any) => void
}

export function useMapInteraction({
  searchResults,
  allSelectedPlaces,
  searchQuery,
  isSearchPanelOpen,
  searchPlaces,
}: UseMapInteractionProps) {
  // --- Refs ---
  const kakaoMapRef = ref<any>(null)
  const selectedMarkerId = ref<number | string | null>(null)
  const showReSearchButton = ref(false)

  // --- Computed: 마커 표시 로직 ---
  const markerPositions = computed(() => {
    // 1. 내 일정 마커
    const tripMarkers = allSelectedPlaces.value.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id,
      type: 'plan',
    }))

    // 2. 검색 결과 마커 (패널 열려있을 때만)
    let searchMarkers: any[] = []
    if (isSearchPanelOpen.value) {
      searchMarkers = searchResults.value.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        id: p.id,
        type: 'search',
      }))
    }
    return [...tripMarkers, ...searchMarkers]
  })

  // --- Actions ---

  // 1. 장소/마커 클릭 시 처리 (지도 이동 & 강조)
  const selectAndPanToPlace = (id: number | string, lat?: number, lng?: number) => {
    selectedMarkerId.value = id

    // 좌표가 인자로 안 들어왔으면(마커 클릭 시), 리스트에서 찾음
    let targetLat = lat
    let targetLng = lng

    if (targetLat === undefined || targetLng === undefined) {
      const target = markerPositions.value.find((m) => String(m.id) === String(id))
      if (target) {
        targetLat = target.lat
        targetLng = target.lng
      }
    }

    if (targetLat !== undefined && targetLng !== undefined && kakaoMapRef.value?.panTo) {
      kakaoMapRef.value.panTo(targetLat, targetLng)
    }
  }

  // 2. 리스트에서 카드 클릭 핸들러
  const handlePlaceClick = (place: Place) => {
    selectAndPanToPlace(place.id, place.lat, place.lng)
  }

  // 3. 지도 마커 클릭 핸들러
  const handleMarkerClick = (id: number | string) => {
    selectAndPanToPlace(id)
  }

  // 4. 지도 움직임 감지
  const onMapMove = () => {
    if (searchQuery.value && isSearchPanelOpen.value) {
      showReSearchButton.value = true
    }
  }

  // 5. 검색 실행 래퍼 (버튼 숨김 + 지도 인스턴스 전달)
  const triggerSearch = () => {
    showReSearchButton.value = false
    const mapInstance = kakaoMapRef.value?.map
    searchPlaces(mapInstance)
  }

  return {
    kakaoMapRef,
    selectedMarkerId,
    showReSearchButton,
    markerPositions,
    handlePlaceClick,
    handleMarkerClick,
    onMapMove,
    triggerSearch, // handleReSearch와 handleSearch를 통합
  }
}
