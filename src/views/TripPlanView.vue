<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col font-sans">
    <TripPlanHeader
      :trip-title="trip.tripTitle.value"
      :trip-date="trip.tripDate.value"
      :formatted-date="trip.formattedDate.value"
      :is-edit-mode="trip.isEditMode.value"
      :total-places-count="trip.allSelectedPlaces.value.length"
      @update:trip-title="trip.tripTitle.value = $event"
      @update:trip-date="trip.tripDate.value = $event"
      @back="handleBack"
      @save="handleSave"
      @delete="trip.deleteTrip"
      @edit="trip.enterEditMode"
    />

    <div class="flex-1 flex overflow-hidden relative z-10">
      <TripPlanPanel
        :style="{ width: `${panelWidth}px` }"
        :days="trip.days.value"
        :active-day="trip.activeDay.value"
        :is-edit-mode="trip.isEditMode.value"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        @update:active-day="trip.activeDay.value = $event"
        @search="handleSearch"
        @remove-place="trip.removePlace"
        @add-day="trip.addDay"
        @remove-day="trip.removeDay"
        @update-places="trip.updatePlaces"
      />

      <div
        class="w-[6px] -ml-[3px] z-30 cursor-col-resize flex items-center justify-center hover:bg-[#9BCCC4] transition-colors opacity-0 hover:opacity-100 active:opacity-100 active:bg-[#9BCCC4]"
        @mousedown="startResize"
      >
        <div class="flex flex-col gap-[2px]">
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
          <div class="w-[3px] h-[3px] rounded-full bg-[#2C2C2C]"></div>
        </div>
      </div>

      <TripSearchListPanel
        v-if="isSearchPanelOpen"
        :results="searchResults"
        :is-loading="isSearching"
        @close="closeSearchPanel"
        @add-place="trip.addPlace"
        @click-item="handlePlaceClick"
      />

      <div class="flex-1 bg-gray-100 relative z-0">
        <KakaoMap
          ref="kakaoMapRef"
          class="absolute inset-0"
          :center="{ lat: 37.5443, lng: 127.0557 }"
          :level="5"
          :markers="markerPositions"
          :selected-marker-id="selectedMarkerId"
        />

        <div class="absolute top-6 right-6 flex flex-col gap-3 z-20">
          <button
            class="w-12 h-12 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all"
          >
            <Plus class="w-6 h-6 text-black" stroke-width="3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import KakaoMap from '@/components/common/KakaoMap.vue'
import TripPlanHeader from '@/components/trip/TripPlanHeader.vue'
import TripPlanPanel from '@/components/trip/TripPlanPanel.vue'
import TripSearchListPanel from '@/components/trip/TripSearchListPanel.vue'

// 로직 파일 Import
import { useResizablePanel } from '@/composables/common/useResizablePanel'
import { usePlaceSearch } from '@/composables/trip/usePlaceSearch'
import { useTripPlan } from '@/composables/trip/useTripPlan'

// 1. 지도 참조 (Ref)
const kakaoMapRef = ref<any>(null)

// 1. 선택된 마커 ID 관리
const selectedMarkerId = ref<number | string | null>(null)

// [NEW] 장소 클릭 시 실행될 함수
const handlePlaceClick = (place: Place) => {
  // 1. 마커 강조 (ID 설정)
  selectedMarkerId.value = place.id

  // 2. 지도 이동 (KakaoMap 컴포넌트의 panTo 함수 호출)
  if (kakaoMapRef.value && kakaoMapRef.value.panTo) {
    kakaoMapRef.value.panTo(place.lat, place.lng)
  }
}

// 2. 패널 리사이징 로직
const { width: panelWidth, startResize } = useResizablePanel({
  initialWidth: 380,
  minWidth: 280,
  maxWidth: 600,
})

// 3. 검색 로직 (지도 Ref를 통해 검색 시 bounds 전달)
const {
  searchQuery,
  searchResults,
  isSearching,
  isSearchPanelOpen,
  searchPlaces,
  closeSearchPanel,
} = usePlaceSearch()

const handleSearch = () => {
  // kakaoMapRef에 있는 map 객체를 꺼내서 전달
  const mapInstance = kakaoMapRef.value?.map
  searchPlaces(mapInstance)
}

// 4. 여행 데이터 로직
const trip = useTripPlan()

// 저장/뒤로가기 시 검색패널 닫기 연결
const handleSave = () => trip.saveTrip(closeSearchPanel)
const handleBack = () => trip.goBack(closeSearchPanel)

// 5. 마커 표시 (일정 마커 + 검색 마커)
const markerPositions = computed(() => {
  const tripMarkers = trip.allSelectedPlaces.value.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    id: p.id,
  }))

  let searchMarkers: any[] = []
  if (isSearchPanelOpen.value) {
    searchMarkers = searchResults.value.map((p) => ({ lat: p.lat, lng: p.lng, id: p.id }))
  }
  return [...tripMarkers, ...searchMarkers]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
.font-sans {
  font-family: 'Outfit', sans-serif;
}
</style>
