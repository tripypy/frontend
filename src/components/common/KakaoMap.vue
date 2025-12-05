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
  selectedMarkerId?: number | string | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const mapLoaded = ref(false)

// 내부에서만 쓰는 마커 배열
let kakaoMarkers: any[] = []

// --- 마커 이미지 설정 ---
// 1. 기본 마커 이미지
const NORMAL_IMAGE_SRC = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
const NORMAL_SIZE = { width: 24, height: 35 }

// 2. 선택된 마커 이미지 (더 크고 눈에 띄는 것 - 예: 파란 별)
const SELECTED_IMAGE_SRC = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
const SELECTED_SIZE = { width: 35, height: 50 } // 사이즈를 키움

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

  // 마커 이미지 객체 미리 생성
  const normalImage = new kakao.maps.MarkerImage(
    NORMAL_IMAGE_SRC,
    new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
  )
  const selectedImage = new kakao.maps.MarkerImage(
    SELECTED_IMAGE_SRC,
    new kakao.maps.Size(SELECTED_SIZE.width, SELECTED_SIZE.height),
  )

  markers.forEach((m) => {
    const pos = new kakao.maps.LatLng(m.lat, m.lng)

    // 현재 마커가 선택된 상태인지 확인
    const isSelected = props.selectedMarkerId && m.id === props.selectedMarkerId

    const marker = new kakao.maps.Marker({
      position: pos,
      map: rawMap,
      // 선택 여부에 따라 이미지 다르게 적용
      image: isSelected ? selectedImage : normalImage,
      zIndex: isSelected ? 10 : 1, // 선택된 걸 더 위로 올림
    })

    // [중요] 나중에 ID로 찾기 위해 마커 객체에 커스텀 속성 추가
    marker.customId = m.id

    kakaoMarkers.push(marker)
    bounds.extend(pos)
  })

  // 마커가 그려질 때, 선택된 마커가 없다면 전체 범위로 조정
  // (만약 특정 마커 하나만 콕 집어서 이동하는 상황이면 bounds 조정 안 함)
  if (!props.selectedMarkerId) {
    rawMap.setBounds(bounds)
  }
}

// [NEW] 외부에서 호출 가능한 지도 이동 함수
const panTo = (lat: number, lng: number) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return

  const kakao = (window as any).kakao
  const moveLatLon = new kakao.maps.LatLng(lat, lng)

  // 부드럽게 이동
  rawMap.panTo(moveLatLon)
}

// [NEW] 선택된 마커 ID가 바뀌면 이미지만 업데이트 (전체 다시 그리기 X)
watch(
  () => props.selectedMarkerId,
  (newId) => {
    const kakao = (window as any).kakao
    if (!kakao) return

    const normalImage = new kakao.maps.MarkerImage(
      NORMAL_IMAGE_SRC,
      new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
    )
    const selectedImage = new kakao.maps.MarkerImage(
      SELECTED_IMAGE_SRC,
      new kakao.maps.Size(SELECTED_SIZE.width, SELECTED_SIZE.height),
    )

    kakaoMarkers.forEach((marker) => {
      if (marker.customId === newId) {
        marker.setImage(selectedImage)
        marker.setZIndex(10)
      } else {
        marker.setImage(normalImage)
        marker.setZIndex(1)
      }
    })
  },
)

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
  panTo,
})
</script>
