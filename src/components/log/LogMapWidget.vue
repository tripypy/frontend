<script setup lang="ts">
import { ref, watchEffect, type PropType } from 'vue';
import KakaoMap from '@/components/common/KakaoMap.vue';
import type { TripDetailResponseDto } from '@/apis/trip/types';

const props = defineProps({
  completedTrips: {
    type: Array as PropType<TripDetailResponseDto[]>,
    required: true
  }
});

const tripPaths = ref<{ path: { lat: number, lng: number }[], color: string, title: string }[]>([]);
const tripMarkers = ref<{ lat: number, lng: number, name: string }[]>([]);
const mapCenter = ref({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

watchEffect(() => {
  // Clear previous data
  tripPaths.value = [];
  tripMarkers.value = [];

  if (props.completedTrips.length > 0) {
    const allPlaces: { lat: number, lng: number }[] = [];
    
    props.completedTrips.forEach((trip, index) => {
      const path = trip.tripItems.map(item => {
        const place = { lat: item.spot.lat, lng: item.spot.lng };
        allPlaces.push(place);
        // Only add markers for the first spot of each trip to reduce clutter
        if (item.orderIndex === 1) {
          tripMarkers.value.push({ ...place, name: trip.title });
        }
        return place;
      });

      if (path.length > 0) {
        tripPaths.value.push({ path, color: colors[index % colors.length], title: trip.title });
      }
    });

    if (allPlaces.length > 0) {
      const avgLat = allPlaces.reduce((sum, p) => sum + p.lat, 0) / allPlaces.length;
      const avgLng = allPlaces.reduce((sum, p) => sum + p.lng, 0) / allPlaces.length;
      mapCenter.value = { lat: avgLat, lng: avgLng };
    }
  }
});
</script>

<template>
  <div class="bg-white border-[4px] border-[#2C2C2C] rounded-[30px] p-6 shadow-[8px_8px_0px_0px_rgba(44,44,44,1)]">
    <div class="flex justify-between items-center mb-3 px-2">
      <h2 class="font-black text-xl text-[#2C2C2C]">TRAVEL MAP</h2>
      <span class="text-sm font-semibold text-gray-600">{{ completedTrips.length }} trips</span>
    </div>
    <div class="w-full h-64 rounded-lg overflow-hidden border-2 border-[#2C2C2C]">
      <KakaoMap
        :center="mapCenter"
        :level="8"
        :polylines="tripPaths"
        :markers="tripMarkers"
        :is-clickable="false"
      />
    </div>
    <div class="mt-4 space-y-2 px-2 max-h-24 overflow-y-auto">
      <div v-for="trip in tripPaths" :key="trip.color" class="flex items-center">
        <div class="w-3 h-3 rounded-full mr-3 flex-shrink-0" :style="{ backgroundColor: trip.color }"></div>
        <span class="text-sm font-medium text-gray-700 truncate" :title="trip.title">{{ trip.title }}</span>
      </div>
      <div v-if="completedTrips.length === 0" class="text-sm text-center text-gray-500 py-4">
        완료된 여행 기록이 없습니다.
      </div>
    </div>
  </div>
</template>
