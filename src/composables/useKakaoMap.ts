// composables/useKakaoMap.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useKakaoMap(containerId: string) {
  const mapLoaded = ref(false)
  const map = ref<any | null>(null)
  let markers: any[] = []

  const clearMarkers = () => {
    markers.forEach((m) => m.setMap(null))
    markers = []
  }

  const addMarkers = (places: { lat: number; lng: number }[]) => {
    if (!map.value) return

    clearMarkers()

    const kakao = (window as any).kakao
    const bounds = new kakao.maps.LatLngBounds()

    places.forEach((p) => {
      const pos = new kakao.maps.LatLng(p.lat, p.lng)
      const marker = new kakao.maps.Marker({ position: pos, map: map.value })
      markers.push(marker)
      bounds.extend(pos)
    })

    if (places.length > 0) map.value.setBounds(bounds)
  }

  const initMap = () => {
    const container = document.getElementById(containerId)
    if (!container) return

    const kakao = (window as any).kakao
    map.value = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    })

    mapLoaded.value = true
  }

  onMounted(() => {
    const kakao = (window as any).kakao
    kakao.maps.load(() => {
      initMap()
    })
  })

  onUnmounted(() => {
    map.value = null
    markers = []
  })

  return { map, mapLoaded, addMarkers, clearMarkers }
}
