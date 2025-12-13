<script setup lang="ts">
import { ref, computed, watchEffect, type PropType } from 'vue';
import type { TripDetailResponseDto } from '@/types/trip';

interface LegendTrip {
  title: string;
  startDate?: string;
  endDate?: string;
  color: string;
}

const props = defineProps({
  completedTrips: {
    type: Array as PropType<TripDetailResponseDto[]>,
    required: true
  }
});

const colors = [
  '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', 
  '#911EB4', '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', 
].reverse(); // Use reversed colors to have more distinct ones first for recent trips

const currentMonth = ref(new Date());
const dateColorMap = ref<Map<string, string>>(new Map());
const tripsForLegend = ref<LegendTrip[]>([]);

const formattedMonth = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth() + 1;
  return `${year}.${month.toString().padStart(2, '0')}`;
});

const daysInMonth = computed(() => {
  const date = currentMonth.value;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  const startDay = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
});

// Date 객체를 'YYYY-MM-DD' 문자열로 변환 (로컬 시간 기준)
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

watchEffect(() => {
  const newDateColorMap = new Map<string, string>();
  const newTripsForLegend: LegendTrip[] = [];

  const sortedTrips = [...props.completedTrips].sort((a, b) => {
    const dateA = new Date(a.endDate || a.startDate || 0).getTime();
    const dateB = new Date(b.endDate || b.startDate || 0).getTime();
    return dateA - dateB; // 오래된 여행부터 순회하여 최신 여행 색상으로 덮어쓰게 함
  });

  sortedTrips.forEach((trip, index) => {
    const tripColor = colors[index % colors.length];
    
    newTripsForLegend.push({
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      color: tripColor,
    });

    if (trip.startDate && trip.endDate) {
      let currentDate = new Date(trip.startDate + 'T00:00:00');
      let endDate = new Date(trip.endDate + 'T00:00:00');
      
      while (currentDate <= endDate) {
        newDateColorMap.set(toYYYYMMDD(currentDate), tripColor);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
  
  dateColorMap.value = newDateColorMap;
  tripsForLegend.value = newTripsForLegend.reverse(); // 범례는 최신순으로 표시
});

function getColorForDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  return dateColorMap.value.get(toYYYYMMDD(date));
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
}
</script>

<template>
  <div class="bg-white border-[4px] border-[#2C2C2C] rounded-[30px] p-6 shadow-[8px_8px_0px_0px_rgba(44,44,44,1)]">
    <div class="flex justify-between items-center mb-3 px-2">
      <h2 class="font-black text-xl text-[#2C2C2C]">CALENDAR</h2>
    </div>

    <div class="flex items-center justify-between mb-4 px-2">
      <button @click="prevMonth" class="p-1 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <span class="text-lg font-bold text-gray-800">{{ formattedMonth }}</span>
      <button @click="nextMonth" class="p-1 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
      <div class="text-red-500">S</div>
      <div>M</div>
      <div>T</div>
      <div>W</div>
      <div>T</div>
      <div>F</div>
      <div class="text-blue-500">S</div>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <div
        v-for="(day, index) in daysInMonth"
        :key="index"
        class="flex items-center justify-center aspect-square rounded-md text-sm font-medium transition-colors"
        :style="{ backgroundColor: getColorForDate(day) }"
        :class="{
          'text-gray-400': !day,
          'text-white font-bold': getColorForDate(day)
        }"
      >
        {{ day ? day.getDate() : '' }}
      </div>
    </div>

    <div class="mt-4 space-y-2 px-2 max-h-24 overflow-y-auto">
        <div v-if="tripsForLegend.length > 0">
          <div v-for="trip in tripsForLegend" :key="trip.title" class="flex items-center text-sm text-[#2C2C2C]">
            <div class="w-2 h-2 rounded-full mr-2 flex-shrink-0" :style="{ backgroundColor: trip.color }"></div>
            <span class="truncate" :title="trip.title">{{ trip.title }} ({{ trip.startDate }} ~ {{ trip.endDate }})</span>
          </div>
        </div>
        <div v-else class="text-sm text-center text-gray-500 py-4">
            완료된 여행 기록이 없습니다.
        </div>
    </div>
  </div>
</template>
