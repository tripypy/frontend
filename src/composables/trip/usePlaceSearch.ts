import type { Place } from '@/types/trip/place.model'
import { ref } from 'vue'

export function usePlaceSearch() {
  const searchQuery = ref('')
  const searchResults = ref<Place[]>([])
  const isSearching = ref(false)
  const isSearchPanelOpen = ref(false)

  // mapInstance: KakaoMap 컴포넌트에서 가져온 지도 객체
  const searchPlaces = (mapInstance?: any) => {
    if (!searchQuery.value.trim()) return

    if (!(window as any).kakao || !(window as any).kakao.maps) {
      alert('카카오맵 SDK가 로드되지 않았습니다.')
      return
    }

    isSearchPanelOpen.value = true
    isSearching.value = true
    searchResults.value = [];

    (window as any).kakao.maps.load(() => {
      if (!(window as any).kakao.maps.services) {
        alert('카카오맵 Services 라이브러리가 로드되지 않았습니다.')
        isSearching.value = false
        return
      }

      const ps = new (window as any).kakao.maps.services.Places()

      // 내부 검색 함수 (재귀적 호출 또는 fallback 처리용)
      const executeSearch = (options: any, isFallbackAttempt: boolean) => {
        ps.keywordSearch(
          searchQuery.value,
          (data: any[], status: any) => {
            // 1. 성공 시
            if (status === (window as any).kakao.maps.services.Status.OK) {
              isSearching.value = false
              console.log('Kakao Search Results:', data)
              searchResults.value = data.map((item: any) => ({
                id: Number(item.id),
                kakaoPlaceId: item.id,
                name: item.place_name,
                address: item.road_address_name || item.address_name,
                category: item.category_group_name || '기타',
                lat: Number(item.y),
                lng: Number(item.x),
                phone: item.phone,
                placeUrl: item.place_url,
              }))
            }
            // 2. 결과 없음 (ZERO_RESULT)
            else if (status === (window as any).kakao.maps.services.Status.ZERO_RESULT) {
              // Fallback: 위치 제한이 있었고, 첫 시도였다면 -> 제한 없이 재검색
              if (options.bounds && !isFallbackAttempt) {
                console.log('No results in current bounds. Retrying globally...')
                executeSearch({}, true) // 재귀 호출 (옵션 제거)
              } else {
                // 진짜 결과 없음
                isSearching.value = false
                searchResults.value = []
              }
            }
            // 3. 에러
            else {
              isSearching.value = false
              alert('검색 중 오류가 발생했습니다.')
            }
          },
          options,
        )
      }

      // 초기 검색 옵션 설정
      let initialOptions: any = {}
      if (mapInstance) {
        const bounds = mapInstance.getBounds()
        initialOptions = { bounds }
      }

      // 첫 검색 실행 (Local First)
      executeSearch(initialOptions, false)
    })
  }

  const closeSearchPanel = () => {
    isSearchPanelOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    isSearchPanelOpen,
    searchPlaces,
    closeSearchPanel,
  }
}
