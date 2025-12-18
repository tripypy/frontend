<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { UserAIAnalysisResponseDto } from '@/apis/user/types'
import { requestFetchUserAIAnalysis } from '@/apis/user/index'
import { WandSparkles } from 'lucide-vue-next';

const analysisData = ref<UserAIAnalysisResponseDto | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchAnalysisData = async () => {
  isLoading.value = true
  error.value = null
  analysisData.value = null

  try {
    const response = await requestFetchUserAIAnalysis()
    analysisData.value = response
  } catch (err) {
    console.error("Failed to fetch analysis data:", err);
    error.value = "데이터를 불러오는 데 실패했습니다.";
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAnalysisData()
})

const formattedData = computed(() => {
  if (!analysisData.value) {
    return null;
  }

  const { keywords, summary, scores } = analysisData.value;

  // scores 객체를 템플릿의 `v-for`에서 사용할 수 있는 배열 형태로 변환합니다.
  const rawPreferences = [
    { name: "휴식", key: 'rest', value: Math.min(100, Math.max(0, scores.rest)) },
    { name: "탐험", key: 'exploration', value: Math.min(100, Math.max(0, scores.exploration)) },
    { name: "활동", key: 'activity', value: Math.min(100, Math.max(0, scores.activity)) },
    { name: "미식", key: 'gourmet', value: Math.min(100, Math.max(0, scores.gourmet)) },
  ];

  const preferences = rawPreferences.map((pref, index) => ({
    ...pref,
    colorClass: GAUGE_COLORS[index % GAUGE_COLORS.length]
  }));

  return {
    summary: summary,
    keywords: keywords,
    preferences: preferences,
  };
});

// --- 게이지 색상 정의 ---
// 휴식 (파란 계열), 탐험 (녹색 계열), 활동 (노란/주황 계열), 미식 (붉은 계열)
const GAUGE_COLORS = [
  'bg-[#9BCCC4]', // 1. 휴식: 현재 사용하던 색상 (민트 계열)
  'bg-[#87C3E1]', // 2. 탐험: 밝은 파랑 계열
  'bg-[#FFCD74]', // 3. 활동: 밝은 주황/노랑 계열
  'bg-[#FF8888]', // 4. 미식: 밝은 빨강 계열
];

</script>

<template>
  <div class="bg-white border-[3px] border-[#2C2C2C] rounded-[15px] p-6 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] flex flex-col lg:flex-row gap-6 relative">
    <div class="absolute top-3 left-4 text-xs font-semibold text-gray-500 flex flex-row items-center gap-1">
      <WandSparkles :size="14"/>AI가 분석한 나의 여행 스타일
    </div>
    <div v-if="isLoading" class="w-full text-center py-10">
      <p class="text-gray-500">분석 데이터를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="w-full text-center py-10">
      <p class="text-red-500 font-bold">{{ error }}</p>
    </div>

    <template v-else-if="formattedData">
      <div class="flex-1 lg:w-1/2 mt-5">
        <div class="mb-4">
          <div v-if="formattedData.keywords.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in formattedData.keywords"
              :key="tag"
              class="bg-[#9BCCC4] text-[#2C2C2C] text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="pref in formattedData.preferences" :key="pref.key">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-[#2C2C2C]">{{ pref.name }}</span>
              <span class="text-xs font-semibold text-gray-600">{{ pref.value }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                :class="pref.colorClass"
                :style="{ width: `${pref.value}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 lg:w-1/2 border-l-2 lg:pl-6 border-gray-200 mt-4">
        <h3 class="text-base font-bold text-gray-600 uppercase mb-2">나의 여행 스타일</h3>
        <p class="text-gray-800 text-sm leading-relaxed">
          {{ formattedData.summary }}
        </p>
      </div>
    </template>
  </div>
</template>
