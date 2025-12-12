<script setup lang="ts">
import { ref, computed, watchEffect, type PropType } from 'vue';
import type { TripDetailResponseDto } from '@/apis/trip/types';

const props = defineProps({
  completedTrips: {
    type: Array as PropType<TripDetailResponseDto[]>,
    required: true
  }
});

const currentMonth = ref(new Date());

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
  const startDay = firstDay.getDay(); // 0 for Sunday, 1 for Monday...

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null); // Empty slots for days before the 1st
  }
  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
});

const highlightedDates = ref<string[]>([]); // YYYY-MM-DD format

watchEffect(() => {
  const dates: Set<string> = new Set();
  props.completedTrips.forEach(trip => {
    if (trip.startDate && trip.endDate) {
      let currentDate = new Date(trip.startDate);
      let endDate = new Date(trip.endDate);
      while (currentDate <= endDate) {
        dates.add(currentDate.toISOString().slice(0, 10)); // YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
  highlightedDates.value = Array.from(dates);
});

function isDateHighlighted(date: Date | null) {
  if (!date) return false;
  return highlightedDates.value.includes(date.toISOString().slice(0, 10));
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
        class="flex items-center justify-center aspect-square rounded-md text-sm font-medium"
        :class="{
          'text-gray-400': !day,
          'text-gray-800': day && !isDateHighlighted(day),
          'bg-[#9BCCC4] text-[#2C2C2C] font-bold': day && isDateHighlighted(day),
        }"
      >
        {{ day ? day.getDate() : '' }}
      </div>
    </div>

    <div class="mt-4 space-y-2 px-2 max-h-24 overflow-y-auto">
        <div v-if="completedTrips.length > 0">
          <div v-for="(trip, index) in completedTrips" :key="index" class="flex items-center text-sm text-[#2C2C2C]">
            <div class="w-2 h-2 rounded-full bg-[#9BCCC4] mr-2 flex-shrink-0"></div>
            <span class="truncate" :title="trip.title">{{ trip.title }} ({{ trip.startDate }} ~ {{ trip.endDate }})</span>
          </div>
        </div>
        <div v-else class="text-sm text-center text-gray-500 py-4">
            완료된 여행 기록이 없습니다.
        </div>
    </div>
  </div>
</template>
