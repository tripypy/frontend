<template>
  <div class="min-h-screen bg-[#F5F5F5] h-screen flex flex-col font-sans">
    <TripPlanHeader
      :trip-title="trip.tripTitle.value"
      :trip-date="trip.tripDate.value"
      :formatted-date="trip.formattedDate.value"
      :is-edit-mode="trip.isEditMode.value"
      :total-places-count="trip.allSelectedPlaces.value.length"
      :trip-status="trip.tripStatus.value"
      :trip-visibility="trip.tripVisibility.value"
      @update:trip-title="trip.tripTitle.value = $event"
      @update:trip-date="trip.tripDate.value = $event"
      @update:trip-status="trip.tripStatus.value = $event"
      @update:trip-visibility="trip.tripVisibility.value = $event"
      @back="tripBack"
      @save="tripSave"
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
        @search="mapInteraction.triggerSearch"
        @add-day="trip.addDay"
        @remove-day="trip.removeDay"
        @remove-place="trip.removePlace"
        @update-places="trip.updatePlaces"
        @click-place="showDetailAndPan"
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
        :selected-id="mapInteraction.selectedMarkerId.value"
        @close="closeSearchPanel"
        @add-place="handleAddPlace"
        @click-item="showDetailAndPan"
      />

      <div class="flex-1 flex flex-col bg-gray-100">
        <div class="flex-1 relative">
          <KakaoMap
            ref="kakaoMapRef"
            class="absolute inset-0"
            :center="{ lat: 37.5443, lng: 127.0557 }"
            :level="5"
            :markers="mapInteraction.markerPositions.value"
            :selected-marker-id="mapInteraction.selectedMarkerId.value"
            @marker-click="showDetailAndPanFromMarker"
            @map-move="mapInteraction.onMapMove"
          />

          <div
            v-if="mapInteraction.showReSearchButton.value"
            class="absolute top-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up"
          >
            <button
              @click="mapInteraction.triggerSearch"
              class="flex items-center gap-2 px-4 py-2.5 bg-white border-[2px] border-[#2C2C2C] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-gray-50 active:scale-95 transition-all text-xs font-black text-[#2C2C2C]"
            >
              <RotateCw class="w-3.5 h-3.5" stroke-width="2.5" />
              현 지도에서 재검색
            </button>
          </div>
        </div>

        <PlaceDetailPanel
          :place="selectedPlaceForDetail"
          @close="selectedPlaceForDetail = null"
        />
      </div>
    </div>

    <!-- AI Chatbot Floating Button -->
    <TripAiChat />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RotateCw } from 'lucide-vue-next'
import KakaoMap from '@/components/common/KakaoMap.vue'
import TripPlanHeader from '@/components/trip/TripPlanHeader.vue'
import TripPlanPanel from '@/components/trip/TripPlanPanel.vue'
import TripSearchListPanel from '@/components/trip/TripSearchListPanel.vue'
import PlaceDetailPanel from '@/components/trip/PlaceDetailPanel.vue'
import type { Place } from '@/types/trip/place.model'

// Import Composables
import { useResizablePanel } from '@/composables/common/useResizablePanel'
import { usePlaceSearch } from '@/composables/trip/usePlaceSearch'
import { useTripPlan } from '@/composables/trip/useTripPlan'
import { useMapInteraction } from '@/composables/trip/useMapInteraction'
import TripAiChat from '@/components/trip/TripAiChat.vue' // [NEW]

// 1. UI Resizer
const { width: panelWidth, startResize } = useResizablePanel({
  initialWidth: 380,
  minWidth: 280,
  maxWidth: 600,
})

// 2. 검색 로직
const {
  searchQuery,
  searchResults,
  isSearching,
  isSearchPanelOpen,
  searchPlaces,
  closeSearchPanel,
} = usePlaceSearch()

// 3. 여행 데이터 로직
const trip = useTripPlan()

// 4. [NEW] 지도 인터랙션 로직 (위의 상태들을 주입해서 연결)
const mapInteraction = useMapInteraction({
  searchResults,
  allSelectedPlaces: trip.allSelectedPlaces,
  searchQuery,
  isSearchPanelOpen,
  searchPlaces,
  activeDay: trip.activeDay, // activeDay 추가
  days: trip.days, // days 추가
})

// 템플릿에서 ref를 쓰기 위해 꺼내줌 (구조분해 해도 되지만, mapInteraction.xxx로 쓰는 게 출처가 명확함)
// 단, ref="kakaoMapRef" 연결을 위해 이것만 별도로 꺼내줍니다.
const { kakaoMapRef } = mapInteraction

const selectedPlaceForDetail = ref<Place | null>(null)

// Helper to find a place from any list by its ID (trip item ID or kakaoPlaceId)
const findPlaceById = (id: number | string): Place | undefined => {
  // Combine search results and all planned places into one array
  const allPlaces = [...searchResults.value, ...trip.allSelectedPlaces.value]
  // Find the place that matches either the trip item ID or the Kakao Place ID
  return allPlaces.find((p) => p.id === id || p.kakaoPlaceId === id)
}

// Wrapper for place/item clicks to show detail panel and pan map with offset
const showDetailAndPan = (place: Place) => {
  selectedPlaceForDetail.value = place
  mapInteraction.handlePlaceClick(place, { panWithOffset: true })
}

// Wrapper for marker clicks to find place data, show panel, and pan map with offset
const showDetailAndPanFromMarker = (id: number | string) => {
  const place = findPlaceById(id)
  if (place) {
    selectedPlaceForDetail.value = place
    mapInteraction.handleMarkerClick(id, { panWithOffset: true })
  } else {
    // If place is not found (e.g., from a different day), just pan without detail
    mapInteraction.handleMarkerClick(id)
  }
}

const handleAddPlace = (place: Place) => {
  const newPlace = trip.addPlace(place)
  if (newPlace) {
    // 추가된 장소는 바로 패널을 띄우고 중심으로 이동
    showDetailAndPan(newPlace)
  }
}

// 저장/뒤로가기 연결
const tripSave = () => {
  console.log('tripSave called')
  trip.saveTrip(closeSearchPanel)
}
const tripBack = () => trip.goBack(closeSearchPanel)
</script>

<style scoped>

.font-sans {
  font-family: 'Outfit', sans-serif;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>