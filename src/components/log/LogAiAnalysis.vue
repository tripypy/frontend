<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

// AI 분석 데이터는 현재 더미 데이터를 사용합니다.
// 실제 구현 시 userId를 기반으로 API를 호출하여 데이터를 가져와야 합니다.
const analysisData = computed(() => {
  // 실제 API 호출 로직은 이곳에 구현됩니다.
  // 예: fetch(`/api/analysis/${props.userId}`).then(...)

  // 현재는 고정된 더미 데이터를 반환합니다.
  return {
    summary: "조용한 골목과 로컬 카페를 찾아다니며, 일상 속 여유를 즐기는 타입입니다.",
    hashtags: ["#COFFEE_LOVER", "#CHILL_VIBE", "#LOCAL_EXPLORER"],
    preferences: [
      { name: "휴식", value: 80 },
      { name: "탐험", value: 50 },
      { name: "활동", value: 30 },
      { name: "미식", value: 70 },
    ]
  };
});
</script>

<template>
  <div class="bg-white border-[4px] border-[#2C2C2C] rounded-[30px] p-6 shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] flex flex-col lg:flex-row gap-6 relative">
    <div class="absolute top-3 right-4 text-xs font-semibold text-gray-500">AI_GENERATED</div>
    <!-- Left Section: Hashtags and Gauges -->
    <div class="flex-1 lg:w-1/2 mt-4">
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-500 uppercase mb-1">City Vibe</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in analysisData.hashtags"
            :key="tag"
            class="bg-[#9BCCC4] text-[#2C2C2C] text-xs font-semibold px-2.5 py-0.5 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="pref in analysisData.preferences" :key="pref.name">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-[#2C2C2C]">{{ pref.name }}</span>
            <span class="text-xs font-semibold text-gray-600">{{ pref.value }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-[#9BCCC4] h-2 rounded-full"
              :style="{ width: `${pref.value}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: Summary -->
    <div class="flex-1 lg:w-1/2 border-l-2 lg:pl-6 border-gray-200 mt-4">
      <h3 class="text-sm font-bold text-gray-500 uppercase mb-2">Summary</h3>
      <p class="text-gray-700 text-sm leading-relaxed">
        {{ analysisData.summary }}
      </p>
    </div>
  </div>
</template>
