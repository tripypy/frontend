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

const emits = defineEmits<{
  (e: 'marker-click', id: number | string): void
  (e: 'map-move'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const mapLoaded = ref(false)
let kakaoMarkers: any[] = []

// 이미지 경로
const DEFAULT_MARKER_SRC = markerImg
const SELECTED_MARKER_SRC = yellowMarkerImg

// 사이즈 설정
const NORMAL_SIZE = { width: 40, height: 40 }
const BIG_SIZE = { width: 45, height: 45 }

const clearMarkers = () => {
  kakaoMarkers.forEach((m) => m.setMap(null))
  kakaoMarkers = []
}

const renderMarkers = (markers: MarkerOption[]) => {
  // [중요] toRaw를 사용하여 Vue Proxy가 벗겨진 순수 지도 객체를 가져옵니다.
  const rawMap = toRaw(map.value)
  if (!rawMap) return

  const kakao = (window as any).kakao
  clearMarkers()

  if (!markers || markers.length === 0) return

  const bounds = new kakao.maps.LatLngBounds()

  const normalImage = new kakao.maps.MarkerImage(
    DEFAULT_MARKER_SRC,
    new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
  )
  const selectedImage = new kakao.maps.MarkerImage(
    SELECTED_MARKER_SRC,
    new kakao.maps.Size(BIG_SIZE.width, BIG_SIZE.height),
  )

  markers.forEach((m) => {
    const pos = new kakao.maps.LatLng(m.lat, m.lng)

    // [중요] ID 비교 시 문자열로 변환하여 비교 (타입 불일치 방지)
    const isSelected = props.selectedMarkerId && String(m.id) === String(props.selectedMarkerId)

    const marker = new kakao.maps.Marker({
      position: pos,
      map: rawMap,
      image: isSelected ? selectedImage : normalImage,
      zIndex: isSelected ? 999 : 1,
      clickable: true, // [필수] 이 옵션이 있어야 클릭 이벤트가 확실하게 동작합니다.
    })

    // 마커 클릭 이벤트 리스너
    kakao.maps.event.addListener(marker, 'click', () => {
      console.log('📌 마커 클릭됨:', m.id) // [디버깅용 로그]
      if (m.id !== undefined && m.id !== null) {
        emits('marker-click', m.id)
      }
    })

    // 나중에 찾기 위해 ID 저장
    marker.customId = m.id
    kakaoMarkers.push(marker)
    bounds.extend(pos)
  })

  // 선택된 마커가 없을 때만 전체 뷰 조정
  if (!props.selectedMarkerId) {
    rawMap.setBounds(bounds)
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
    console.log('👀 선택된 ID 변경됨:', newId) // [디버깅용 로그]

    const kakao = (window as any).kakao
    if (!kakao) return

    const normalImage = new kakao.maps.MarkerImage(
      DEFAULT_MARKER_SRC,
      new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
    )
    const selectedImage = new kakao.maps.MarkerImage(
      SELECTED_MARKER_SRC,
      new kakao.maps.Size(BIG_SIZE.width, BIG_SIZE.height),
    )

    kakaoMarkers.forEach((marker) => {
      if (marker.customId === newId) {
        marker.setImage(selectedImage)
        marker.setZIndex(999)
      } else {
        marker.setImage(normalImage)
        marker.setZIndex(1)
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
