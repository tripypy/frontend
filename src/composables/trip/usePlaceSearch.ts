import type { Place } from '@/types/trip'
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
    searchResults.value = []

    const ps = new (window as any).kakao.maps.services.Places()
    let searchOption = {}

    // 지도 객체가 넘어왔다면 현재 보고 있는 범위(Bounds)를 옵션에 추가
    if (mapInstance) {
      const bounds = mapInstance.getBounds()
      searchOption = { bounds }
    }

    ps.keywordSearch(
      searchQuery.value,
      (data: any[], status: any) => {
        isSearching.value = false
        if (status === (window as any).kakao.maps.services.Status.OK) {
          searchResults.value = data.map((item: any) => ({
            id: Number(item.id),
            kakaoPlaceId: item.id, // 카카오 ID를 문자열로 저장
            name: item.place_name,
            address: item.road_address_name || item.address_name,
            category: item.category_group_name || '기타',
            lat: Number(item.y),
            lng: Number(item.x),
            phone: item.phone,
            url: item.place_url,
          }))
        } else if (status === (window as any).kakao.maps.services.Status.ZERO_RESULT) {
          searchResults.value = []
        } else {
          alert('검색 중 오류가 발생했습니다.')
        }
      },
      searchOption,
    )
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
