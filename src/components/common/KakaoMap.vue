<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>

    <div
      v-if="!mapLoaded"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C2C2C] mx-auto mb-3"
        ></div>
        <p class="font-bold text-gray-600">지도를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw, toRaw } from 'vue'

interface LatLng {
  lat: number
  lng: number
}

interface MarkerOption extends LatLng {
  id?: number | string
}

const props = defineProps<{
  center?: LatLng
  level?: number
  markers?: MarkerOption[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const mapLoaded = ref(false)

// 내부에서만 쓰는 마커 배열
let kakaoMarkers: any[] = []

const clearMarkers = () => {
  kakaoMarkers.forEach((m) => m.setMap(null))
  kakaoMarkers = []
}

const renderMarkers = (markers: MarkerOption[]) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return

  const kakao = (window as any).kakao

  clearMarkers()

  if (!markers || markers.length === 0) return

  const bounds = new kakao.maps.LatLngBounds()

  markers.forEach((m) => {
    const pos = new kakao.maps.LatLng(m.lat, m.lng)

    const marker = new kakao.maps.Marker({
      position: pos,
      map: rawMap,
    })
    kakaoMarkers.push(marker)
    bounds.extend(pos)
  })

  rawMap.setBounds(bounds)
}

const initMap = () => {
  if (!mapContainer.value) {
    console.error('[KakaoMap] mapContainer가 없습니다.')
    return
  }

  const kakao = (window as any).kakao
  if (!kakao || !kakao.maps) {
    console.error('[KakaoMap] kakao.maps가 없습니다. SDK 로드를 확인하세요.')
    return
  }

  const center = props.center ?? { lat: 37.5665, lng: 126.978 } // 서울 시청
  const level = props.level ?? 5

  const mapInstance = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(center.lat, center.lng),
    level,
  })

  // markRaw 처리 (잘 하셨습니다!)
  map.value = markRaw(mapInstance)
  mapLoaded.value = true

  if (props.markers && props.markers.length > 0) {
    renderMarkers(props.markers)
  }
}

onMounted(() => {
  const kakao = (window as any).kakao
  if (!kakao || !kakao.maps) {
    console.error('[KakaoMap] window.kakao 또는 kakao.maps가 없습니다.')
    return
  }

  if (typeof kakao.maps.load === 'function') {
    kakao.maps.load(() => {
      initMap()
    })
  } else {
    initMap()
  }
})

onUnmounted(() => {
  clearMarkers()
  map.value = null
})

watch(
  () => props.markers,
  (newVal) => {
    if (!mapLoaded.value || !map.value) return
    renderMarkers(newVal ?? [])
  },
  { deep: true },
)

// [수정된 부분]
// getMap 함수 대신 map 객체 자체를 내보냅니다.
// 그래야 부모에서 kakaoMapRef.value.map 형태로 접근 가능합니다.
defineExpose({
  map,
})
</script>
