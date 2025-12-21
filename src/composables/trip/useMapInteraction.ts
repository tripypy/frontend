// src/composables/trip/useMapInteraction.ts
import { ref, computed, type Ref } from 'vue'
import type { Place, DayPlan } from '@/types/trip/place.model'

// 필요한 외부 데이터나 함수들의 타입을 정의
interface UseMapInteractionProps {
  searchResults: Ref<Place[]>
  allSelectedPlaces: Ref<Place[]>
  searchQuery: Ref<string>
  isSearchPanelOpen: Ref<boolean>
  searchPlaces: (mapInstance?: any) => void
  activeDay: Ref<number> // activeDay 추가
  days: Ref<DayPlan[]> // days 추가
}

export function useMapInteraction({
  searchResults,
  searchQuery,
  isSearchPanelOpen,
  searchPlaces,
  activeDay, // activeDay 추가
  days, // days 추가
}: UseMapInteractionProps) {
  // --- Refs ---
  const kakaoMapRef = ref<any>(null)
  const selectedMarkerId = ref<number | string | null>(null)
  const showReSearchButton = ref(false)

  // --- Computed: 마커 표시 로직 ---
  const markerPositions = computed(() => {
    // 현재 활성화된 일차의 장소들만 필터링
    const currentDayPlaces = days.value.find(day => day.dayNumber === activeDay.value)?.places || [];

    // 현재 일차의 장소들의 kakaoPlaceId를 기반으로 Set 생성
    const planKakaoPlaceIds = new Set(currentDayPlaces.map((p) => p.kakaoPlaceId))

    // 1. 내 일정 마커 (현재 활성화된 일차의 장소만 'plan' 타입으로 표시)
    const tripMarkers = currentDayPlaces.map((p, index) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id || p.kakaoPlaceId, // tripItemId가 있으면 사용, 없으면 kakaoPlaceId 사용
      kakaoPlaceId: p.kakaoPlaceId, // kakaoPlaceId도 저장
      type: 'plan' as const,
      order: index + 1, // 순서 번호 추가
    }))

    // 2. 검색 결과 마커 (패널 열려있을 때만, 현재 일차 일정에 없는 것만)
    let searchMarkers: any[] = []
    if (isSearchPanelOpen.value) {
      searchMarkers = searchResults.value
        .filter((p) => !planKakaoPlaceIds.has(p.kakaoPlaceId)) // [핵심 수정] 이미 일정에 있는 건 kakaoPlaceId로 필터링
        .map((p) => ({
          lat: p.lat,
          lng: p.lng,
          id: p.kakaoPlaceId, // 검색 결과는 kakaoPlaceId를 id로 사용
          kakaoPlaceId: p.kakaoPlaceId,
          type: 'search' as const,
        }))
    }
    return [...tripMarkers, ...searchMarkers]
  })

  // --- Actions ---

  // 1. 장소/마커 클릭 시 처리 (지도 이동 & 강조)
  const selectAndPanToPlace = (
    id: number | string,
    lat?: number,
    lng?: number,
    options?: { panWithOffset?: boolean }
  ) => {
    selectedMarkerId.value = id

    // 좌표가 인자로 안 들어왔으면(마커 클릭 시), 리스트에서 찾음
    let targetLat = lat
    let targetLng = lng

    if (targetLat === undefined || targetLng === undefined) {
      // id가 tripItemId일 수도, kakaoPlaceId일 수도 있으므로 둘 다 비교
      const target = markerPositions.value.find(
        (m) => String(m.id) === String(id) || String(m.kakaoPlaceId) === String(id)
      )
      if (target) {
        targetLat = target.lat
        targetLng = target.lng
      }
    }

    if (targetLat !== undefined && targetLng !== undefined && kakaoMapRef.value?.panTo) {
      let finalLat = targetLat

      // panWithOffset 옵션이 true일 경우, 지도 중심을 아래로 이동시켜 마커가 위쪽에 표시되도록 함
      if (options?.panWithOffset) {
        const map = kakaoMapRef.value.map
        if (!map) {
          kakaoMapRef.value.panTo(targetLat, targetLng)
          return
        }

        const bounds = map.getBounds()
        const mapDiv = kakaoMapRef.value.$el

        if (bounds && mapDiv && mapDiv.offsetHeight > 0) {
          const mapHeightInPixels = mapDiv.offsetHeight
          // 패널 높이(256px)의 약 1/3인 85px을 오프셋으로 사용
          const pixelOffset = 85

          const latSpan = bounds.getNorthEast().getLat() - bounds.getSouthWest().getLat()
          const latOffset = (latSpan / mapHeightInPixels) * pixelOffset

          finalLat -= latOffset // 중심을 아래로 이동 (마커가 위로 올라와 보임)
        }
      }
      kakaoMapRef.value.panTo(finalLat, targetLng)
    }
  }

  // 2. 리스트에서 카드 클릭 핸들러
  const handlePlaceClick = (place: Place, options?: { panWithOffset?: boolean }) => {
    // place.id (tripItemId)가 있으면 그걸 사용하고, 없으면 kakaoPlaceId 사용
    selectAndPanToPlace(place.id || place.kakaoPlaceId, place.lat, place.lng, options)
  }

  // 3. 지도 마커 클릭 핸들러
  const handleMarkerClick = (id: number | string, options?: { panWithOffset?: boolean }) => {
    selectAndPanToPlace(id, undefined, undefined, options)
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
    selectAndPanToPlace, // [NEW] Expose for direct usage (e.g. AI recommendation)
    onMapMove,
    triggerSearch, // handleReSearch와 handleSearch를 통합
  }
}
