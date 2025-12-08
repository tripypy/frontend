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
import markerImg from '@/assets/marker.png'
import yellowMarkerImg from '@/assets/yellow-marker.png'
import pinImg from '@/assets/pin.png'

interface LatLng {
  lat: number
  lng: number
}

interface MarkerOption extends LatLng {
  id?: number | string // tripItemId 또는 kakaoPlaceId
  kakaoPlaceId?: string // kakaoPlaceId 추가
  type?: 'plan' | 'search'
}

const props = defineProps<{
  center?: LatLng
  level?: number
  markers?: MarkerOption[]
  selectedMarkerId?: number | string | null
}>()

const emits = defineEmits<{
  (e: 'marker-click', id: number | string): void
  (e: 'map-move'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const mapLoaded = ref(false)

let kakaoMarkers: any[] = []
let kakaoPolyline: any = null

// 이미지 경로
const DEFAULT_MARKER_SRC = markerImg
const SELECTED_MARKER_SRC = yellowMarkerImg
const PIN_MARKER_SRC = pinImg

// 사이즈 설정
const NORMAL_SIZE = { width: 40, height: 40 }
const BIG_SIZE = { width: 45, height: 45 }
const PIN_SIZE = { width: 35, height: 35 }
const PIN_BIG_SIZE = { width: 45, height: 45 }

const clearMarkers = () => {
  kakaoMarkers.forEach((m) => m.setMap(null))
  kakaoMarkers = []

  if (kakaoPolyline) {
    kakaoPolyline.setMap(null)
    kakaoPolyline = null
  }
}

const renderMarkers = (markers: MarkerOption[]) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return

  const kakao = (window as any).kakao
  clearMarkers()

  if (!markers || markers.length === 0) return

  const bounds = new kakao.maps.LatLngBounds()

  // 이미지 객체 미리 생성
  const normalImage = new kakao.maps.MarkerImage(
    DEFAULT_MARKER_SRC,
    new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
  )
  const selectedImage = new kakao.maps.MarkerImage(
    SELECTED_MARKER_SRC,
    new kakao.maps.Size(BIG_SIZE.width, BIG_SIZE.height),
  )
  const pinImage = new kakao.maps.MarkerImage(
    PIN_MARKER_SRC,
    new kakao.maps.Size(PIN_SIZE.width, PIN_SIZE.height),
  )
  const selectedPinImage = new kakao.maps.MarkerImage(
    PIN_MARKER_SRC,
    new kakao.maps.Size(PIN_BIG_SIZE.width, PIN_BIG_SIZE.height),
  )

  markers.forEach((m) => {
    const pos = new kakao.maps.LatLng(m.lat, m.lng)
    const isSelected = props.selectedMarkerId && String(m.id) === String(props.selectedMarkerId)

    // [핵심] 이미지 결정 로직
    let targetImage
    let zIndex

    if (m.type === 'plan') {
      // 계획된 장소인 경우: 선택되면 '큰 핀', 아니면 '일반 핀'
      targetImage = isSelected ? selectedPinImage : pinImage
      zIndex = isSelected ? 999 : 50
    } else {
      // 검색된 장소인 경우: 선택되면 '노란 마커', 아니면 '파란 마커'
      targetImage = isSelected ? selectedImage : normalImage
      zIndex = isSelected ? 999 : 1
    }

    const marker = new kakao.maps.Marker({
      position: pos,
      map: rawMap,
      image: targetImage,
      zIndex: zIndex,
      clickable: true,
    })

    // 속성 저장 (나중에 watch에서 씀)
    marker.customId = m.id
    marker.customType = m.type // type도 저장해둬야 watch에서 복구 가능

    kakao.maps.event.addListener(marker, 'click', () => {
      if (m.id !== undefined && m.id !== null) {
        emits('marker-click', m.id)
      }
    })

    kakaoMarkers.push(marker)
    bounds.extend(pos)
  })

  // [NEW] 마커를 다 찍은 후, 선 연결하기
  renderPolyline(markers)

  if (!props.selectedMarkerId) {
    rawMap.setBounds(bounds)
  }
}

const renderPolyline = (markers: MarkerOption[]) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return
  const kakao = (window as any).kakao

  // 'plan' 타입인 마커들의 좌표만 추출
  const linePath = markers
    .filter((m) => m.type === 'plan')
    .map((m) => new kakao.maps.LatLng(m.lat, m.lng))

  if (linePath.length > 1) {
    kakaoPolyline = new kakao.maps.Polyline({
      path: linePath, // 선을 구성하는 좌표배열
      strokeWeight: 3, // 선의 두께
      strokeColor: '#2C2C2C', // 선의 색깔 (테두리색과 맞춤)
      strokeOpacity: 0.8, // 선의 불투명도
      strokeStyle: 'solid', // 선의 스타일
    })
    kakaoPolyline.setMap(rawMap)
  }
}

const panTo = (lat: number, lng: number) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return
  const kakao = (window as any).kakao
  rawMap.panTo(new kakao.maps.LatLng(lat, lng))
}

// [핵심] 선택된 마커 ID 변경 감지 -> 이미지 교체
watch(
  () => props.selectedMarkerId,
  (newId) => {
    const kakao = (window as any).kakao
    if (!kakao) return

    // 이미지 객체들 다시 생성 (위와 동일)
    const normalImage = new kakao.maps.MarkerImage(
      DEFAULT_MARKER_SRC,
      new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
    )
    const selectedImage = new kakao.maps.MarkerImage(
      SELECTED_MARKER_SRC,
      new kakao.maps.Size(BIG_SIZE.width, BIG_SIZE.height),
    )
    const pinImage = new kakao.maps.MarkerImage(
      PIN_MARKER_SRC,
      new kakao.maps.Size(PIN_SIZE.width, PIN_SIZE.height),
    )
    const selectedPinImage = new kakao.maps.MarkerImage(
      PIN_MARKER_SRC,
      new kakao.maps.Size(PIN_BIG_SIZE.width, PIN_BIG_SIZE.height),
    )

    kakaoMarkers.forEach((marker) => {
      const isTarget = String(marker.customId) === String(newId)

      if (marker.customType === 'plan') {
        // Plan 마커 로직: 선택되면 큰 핀, 아니면 일반 핀
        marker.setImage(isTarget ? selectedPinImage : pinImage)
        marker.setZIndex(isTarget ? 999 : 50)
      } else {
        // Search 마커 로직: 선택되면 노란 마커, 아니면 파란 마커
        marker.setImage(isTarget ? selectedImage : normalImage)
        marker.setZIndex(isTarget ? 999 : 1)
      }
    })
  },
)

const initMap = () => {
  if (!mapContainer.value) return
  const kakao = (window as any).kakao
  if (!kakao || !kakao.maps) return

  const center = props.center ?? { lat: 37.5665, lng: 126.978 }
  const level = props.level ?? 5

  const mapInstance = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(center.lat, center.lng),
    level,
  })

  kakao.maps.event.addListener(mapInstance, 'dragend', () => {
    emits('map-move')
  })
  kakao.maps.event.addListener(mapInstance, 'zoom_changed', () => {
    emits('map-move')
  })

  // [중요] markRaw로 감싸서 Vue 반응성 시스템이 지도 객체를 건드리지 않게 함
  map.value = markRaw(mapInstance)
  mapLoaded.value = true

  if (props.markers && props.markers.length > 0) {
    renderMarkers(props.markers)
  }
}

onMounted(() => {
  const kakao = (window as any).kakao
  if (kakao && kakao.maps) {
    if (typeof kakao.maps.load === 'function') {
      kakao.maps.load(() => {
        initMap()
      })
    } else {
      initMap()
    }
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

defineExpose({
  map,
  panTo,
})
</script>
