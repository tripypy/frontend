<script setup lang="ts">

import { ref, watch, type PropType } from 'vue'
import KakaoMap from '@/components/common/KakaoMap.vue'
import type { TripDetailResponseDto, TripItemResponseDto } from '@/apis/trip/types'

// --- TYPES ---
interface LegendDay {
  tripId: number
  tripTitle: string
  dayNumber: number
  date: string
  color: string
}

interface TripPath {
  path: { lat: number; lng: number }[]
  color: string
}

interface TripMarker {
  lat: number
  lng: number
  name: string
  color: string
  type: 'plan' // 마커 타입을 plan으로 지정
}

interface ProcessedDay {
    tripId: number;
    tripTitle: string;
    dayNumber: number;
    date: Date;
    items: TripItemResponseDto[];
}

const props = defineProps({
  completedTrips: {
    type: Array as PropType<TripDetailResponseDto[]>,
    required: true
  }
})

// --- REFS ---
const colors = [
  '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', 
  '#911EB4', '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', 
  '#008080', '#E6BEFF', '#9A6324', '#FFFAC8', '#800000', 
  '#AAFFC3', '#808000', '#FFD8B1', '#000075', '#808080'
];

const legendDays = ref<LegendDay[]>([])
const tripPaths = ref<TripPath[]>([])
const tripMarkers = ref<TripMarker[]>([])
const mapCenter = ref({ lat: 37.5665, lng: 126.9780 })

// --- LOGIC ---
// Date 객체를 'YYYY-MM-DD' 문자열로 변환
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

watch(
  () => props.completedTrips,
  (newTrips) => {
    if (!newTrips || newTrips.length === 0) {
      legendDays.value = []
      tripPaths.value = []
      tripMarkers.value = []
      return
    }

    const allDays: ProcessedDay[] = [];

    // 1. 모든 여행의 모든 Day를 하나의 배열로 통합
    newTrips.forEach(trip => {
      if (!trip.tripItems || trip.tripItems.length === 0) return;

      const days = trip.tripItems.reduce((acc, item) => {
        (acc[item.dayNumber] = acc[item.dayNumber] || []).push(item);
        return acc;
      }, {} as Record<number, TripItemResponseDto[]>);

      Object.keys(days).forEach(dayNumberStr => {
        const dayNumber = parseInt(dayNumberStr, 10);
        const dayItems = days[dayNumber];
        const startDate = new Date(trip.startDate + 'T00:00:00');
        // Note: setDate mutates the date object. Create a new one to avoid issues.
        const dayDate = new Date(startDate.getTime());
        dayDate.setDate(dayDate.getDate() + dayNumber - 1);
        
        allDays.push({
          tripId: trip.id,
          tripTitle: trip.title,
          dayNumber: dayNumber,
          date: dayDate,
          items: dayItems.sort((a, b) => a.orderIndex - b.orderIndex)
        });
      });
    });

    // 2. Day를 날짜순으로 정렬 후 상위 3개만 선택
    const daysToDisplay = allDays.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

    // 3. 선택된 Day 3개만 순회하며 경로, 마커, 범례 데이터 생성
    const newLegendDays: LegendDay[] = [];
    const newTripPaths: TripPath[] = [];
    const newTripMarkers: TripMarker[] = [];
    const allDrawablePlaces: { lat: number, lng: number }[] = [];
    
    daysToDisplay.forEach((day, index) => {
      const dayColor = colors[index % colors.length];

      // 마커 생성
      day.items.forEach(item => {
        newTripMarkers.push({
          lat: item.spot.lat,
          lng: item.spot.lng,
          name: item.spot.name,
          color: dayColor,
          type: 'plan'
        });
      });

      // 경로 생성
      const path = day.items.map(item => ({ lat: item.spot.lat, lng: item.spot.lng }));
      if (path.length > 1) {
        newTripPaths.push({ path, color: dayColor });
        allDrawablePlaces.push(...path);
      }

      // 범례 생성
      newLegendDays.push({
        tripId: day.tripId,
        tripTitle: day.tripTitle,
        dayNumber: day.dayNumber,
        date: toYYYYMMDD(day.date),
        color: dayColor
      });
    });

    legendDays.value = newLegendDays;
    tripPaths.value = newTripPaths;
    tripMarkers.value = newTripMarkers;

    // 4. 지도 중앙점 계산
    const placesForCenter = allDrawablePlaces.length > 0 ? allDrawablePlaces : newTripMarkers;
    if (placesForCenter.length > 0) {
      const avgLat = placesForCenter.reduce((sum, p) => sum + p.lat, 0) / placesForCenter.length;
      const avgLng = placesForCenter.reduce((sum, p) => sum + p.lng, 0) / placesForCenter.length;
      mapCenter.value = { lat: avgLat, lng: avgLng };
    }
  },
  { immediate: true, deep: true }
);
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
    <div class="mt-4 space-y-2 px-2">
      <h3 class="text-sm font-black text-[#2C2C2C] mb-2 px-1">최근 다녀온 여행</h3>
      <div v-for="day in legendDays" :key="`${day.tripId}-${day.dayNumber}`" class="flex items-center py-1">
        <div class="w-3 h-3 rounded-full mr-3 flex-shrink-0" :style="{ backgroundColor: day.color }"></div>
        <div class="flex items-center text-sm font-medium text-gray-700 overflow-hidden">
          <span class="font-bold truncate" :title="day.tripTitle">{{ day.tripTitle }} - Day {{ day.dayNumber }}</span> 
          <span class="text-gray-500 ml-2 flex-shrink-0">- {{ day.date }}</span>
        </div>
      </div>
      <div v-if="completedTrips.length === 0" class="text-sm text-center text-gray-500 py-4">
        완료된 여행 기록이 없습니다.
      </div>
    </div>
  </div>
</template>
