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
import { ref, onMounted, onUnmounted, watch, markRaw, toRaw } from 'vue' // markRaw, toRaw 추가

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
const map = ref<any | null>(null)
const mapLoaded = ref(false)

// 내부에서만 쓰는 마커 배열 (반응형일 필요 없음)
let kakaoMarkers: any[] = []

const clearMarkers = () => {
  kakaoMarkers.forEach((m) => m.setMap(null))
  kakaoMarkers = []
}

const renderMarkers = (markers: MarkerOption[]) => {
  // map.value가 Proxy일 수 있으므로 toRaw로 원본 객체를 가져와서 안전하게 접근
  const rawMap = toRaw(map.value)
  if (!rawMap) return

  const kakao = (window as any).kakao

  clearMarkers()

  if (!markers || markers.length === 0) return

  const bounds = new kakao.maps.LatLngBounds()

  markers.forEach((m) => {
    const pos = new kakao.maps.LatLng(m.lat, m.lng)

    // 마커 생성 시에도 map 속성에 원본 맵 객체(rawMap)를 할당
    const marker = new kakao.maps.Marker({
      position: pos,
      map: rawMap,
    })
    kakaoMarkers.push(marker)
    bounds.extend(pos)
  })

  // 모든 마커가 보이도록 범위 조정
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

  // ★ 핵심 수정: 생성된 맵 인스턴스를 markRaw로 감싸서 반응형 시스템에서 제외시킴
  const mapInstance = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(center.lat, center.lng),
    level,
  })

  // Vue가 이 객체를 Proxy로 만들지 못하게 막음 -> 'reading b' 에러 해결
  map.value = markRaw(mapInstance)

  mapLoaded.value = true

  // 초기 markers 있으면 바로 렌더링
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

  // autoload=false 기준
  if (typeof kakao.maps.load === 'function') {
    kakao.maps.load(() => {
      initMap()
    })
  } else {
    // 혹시 autoload=false 안 쓴 경우 fallback
    initMap()
  }
})

onUnmounted(() => {
  clearMarkers()
  map.value = null
})

// markers prop 변경 시 마커 다시 그림
watch(
  () => props.markers,
  (newVal) => {
    if (!mapLoaded.value || !map.value) return
    renderMarkers(newVal ?? [])
  },
  { deep: true },
)

// 부모가 필요하면 map 인스턴스를 직접 가져가 쓸 수 있도록
defineExpose({
  getMap: () => map.value,
})
</script>
