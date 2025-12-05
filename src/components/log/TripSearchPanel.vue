<template>
  <div
    class="w-[320px] bg-white border-r-[3px] border-[#2C2C2C] flex flex-col h-full relative flex-shrink-0 z-10 shadow-xl"
  >
    <div class="p-3 border-b-[2px] border-gray-200 flex items-center justify-between bg-white">
      <h3 class="font-black text-sm text-[#2C2C2C]">검색 결과 ({{ results.length }})</h3>
      <button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-full">
        <X class="w-4 h-4 text-gray-500" stroke-width="2.5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 bg-white">
      <div v-if="isLoading" class="p-8 text-center">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C2C2C] mx-auto mb-2"
        ></div>
        <p class="text-[11px] font-bold text-gray-500">검색 중입니다...</p>
      </div>

      <template v-else-if="results.length > 0">
        <button
          v-for="place in results"
          :key="place.id"
          @click="$emit('add-place', place)"
          class="w-full p-3 mb-2 bg-white border-[2px] border-gray-200 hover:border-[#2C2C2C] hover:bg-[#FFF8ED] rounded-lg transition-all text-left group shadow-sm hover:shadow-md"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-md border-[2px] border-[#2C2C2C] flex items-center justify-center flex-shrink-0 bg-[#9BCCC4]"
            >
              <MapPin class="w-4 h-4" stroke-width="2.5" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-black text-xs mb-1 truncate text-[#2C2C2C]">{{ place.name }}</h4>
              <p class="text-[10px] font-bold text-gray-500 truncate mb-1">{{ place.address }}</p>
              <span
                class="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-600"
                >{{ place.category }}</span
              >
            </div>
            <div class="self-center">
              <Plus
                class="w-4 h-4 text-gray-300 group-hover:text-[#2C2C2C] transition-colors"
                stroke-width="3"
              />
            </div>
          </div>
        </button>
      </template>

      <div v-else class="p-8 text-center">
        <div
          class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <Search class="w-5 h-5 text-gray-300" />
        </div>
        <p class="text-[11px] font-bold text-gray-500">검색 결과가 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, MapPin, Plus, Search } from 'lucide-vue-next'
// 타입은 별도 파일(types.ts)로 관리하거나 여기서 정의
interface Place {
  id: number
  name: string
  address: string
  category: string
  lat: number
  lng: number
}

// 부모에게서 받을 데이터 (Props)
defineProps<{
  results: Place[]
  isLoading: boolean
}>()

// 부모에게 보낼 신호 (Emits)
defineEmits<{
  (e: 'close'): void
  (e: 'add-place', place: Place): void
}>()
</script>
