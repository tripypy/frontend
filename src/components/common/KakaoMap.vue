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
  kakaoPlaceId?: string
  type?: 'plan' | 'search'
  order?: number
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

let kakaoOverlays: any[] = []
let kakaoPolyline: any = null

const DEFAULT_MARKER_SRC = markerImg
const SELECTED_MARKER_SRC = yellowMarkerImg

const NORMAL_SIZE = { width: 40, height: 40 }
const BIG_SIZE = { width: 45, height: 45 }

const clearMarkers = () => {
  kakaoOverlays.forEach((m) => m.setMap(null))
  kakaoOverlays = []

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
    const isSelected = props.selectedMarkerId && String(m.id) === String(props.selectedMarkerId)

    if (m.type === 'plan') {
      const content = document.createElement('div')
      content.className = `
        flex items-center justify-center w-12 h-12 rounded-full font-black text-black border-[2px] border-[#2C2C2C]
        transition-all duration-200 ease-in-out
        ${isSelected ? 'bg-[#FF8A00] scale-110' : 'bg-[#9BCCC4]'}
      `
      content.innerHTML = String(m.order || '')

      const customOverlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: content,
        map: rawMap,
        yAnchor: 0.5,
        zIndex: isSelected ? 999 : 50,
      })

      content.onclick = () => {
        if (m.id !== undefined && m.id !== null) {
          emits('marker-click', m.id)
        }
      }

      customOverlay.customId = m.id
      customOverlay.customType = m.type
      customOverlay.customOrder = m.order
      kakaoOverlays.push(customOverlay)
    } else {
      const marker = new kakao.maps.Marker({
        position: pos,
        map: rawMap,
        image: isSelected ? selectedImage : normalImage,
        zIndex: isSelected ? 999 : 1,
        clickable: true,
      })

      marker.customId = m.id
      marker.customType = m.type

      kakao.maps.event.addListener(marker, 'click', () => {
        if (m.id !== undefined && m.id !== null) {
          emits('marker-click', m.id)
        }
      })
      kakaoOverlays.push(marker)
    }
    bounds.extend(pos)
  })

  renderPolyline(markers)

  if (!props.selectedMarkerId) {
    rawMap.setBounds(bounds)
  }
}

const renderPolyline = (markers: MarkerOption[]) => {
  const rawMap = toRaw(map.value)
  if (!rawMap) return
  const kakao = (window as any).kakao

  const linePath = markers
    .filter((m) => m.type === 'plan')
    .map((m) => new kakao.maps.LatLng(m.lat, m.lng))

  if (linePath.length > 1) {
    kakaoPolyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 3,
      strokeColor: '#2C2C2C',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
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

watch(
  () => props.selectedMarkerId,
  (newId) => {
    if (!mapLoaded.value) return // Add guard clause

    const kakao = (window as any).kakao
    if (!kakao || !kakao.maps) return

    const normalImage = new kakao.maps.MarkerImage(
      DEFAULT_MARKER_SRC,
      new kakao.maps.Size(NORMAL_SIZE.width, NORMAL_SIZE.height),
    )
    const selectedImage = new kakao.maps.MarkerImage(
      SELECTED_MARKER_SRC,
      new kakao.maps.Size(BIG_SIZE.width, BIG_SIZE.height),
    )

    kakaoOverlays.forEach((overlay) => {
      const isTarget = String(overlay.customId) === String(newId)

      if (overlay.customType === 'plan') {
        const content = overlay.getContent()
        if (isTarget) {
          content.classList.remove('bg-[#9BCCC4]')
          content.classList.add('bg-[#FF8A00]', 'scale-110')
        } else {
          content.classList.remove('bg-[#FF8A00]', 'scale-110')
          content.classList.add('bg-[#9BCCC4]')
        }
        overlay.setZIndex(isTarget ? 999 : 50)
      } else {
        // This is a kakao.maps.Marker
        overlay.setImage(isTarget ? selectedImage : normalImage)
        overlay.setZIndex(isTarget ? 999 : 1)
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

  map.value = markRaw(mapInstance)
  mapLoaded.value = true

  if (props.markers && props.markers.length > 0) {
    renderMarkers(props.markers)
  }
}

onMounted(() => {
  const checkKakao = () => {
    const kakao = (window as any).kakao
    if (kakao && kakao.maps) {
      if (typeof kakao.maps.load === 'function') {
        kakao.maps.load(() => {
          initMap()
        })
      } else {
        initMap()
      }
    } else {
      setTimeout(checkKakao, 200) // Poll every 200ms
    }
  }
  checkKakao()
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
