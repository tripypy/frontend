<template>
  <div
    class="w-[300px] bg-white border-r-[3px] border-[#2C2C2C] flex flex-col h-full relative flex-shrink-0"
  >
    <div class="p-4 border-b-[2px] border-gray-200 flex items-center justify-between bg-gray-50">
      <h3 class="font-black text-[12px] uppercase tracking-wide text-[#2C2C2C]">
        Search Results ({{ results.length }})
      </h3>
      <button
        @click="$emit('close')"
        class="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
      >
        <X class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 bg-white">
      <div v-if="isLoading" class="py-10 text-center">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C2C2C] mx-auto mb-2"
        ></div>
        <p class="text-[10px] font-bold text-gray-400">검색 중...</p>
      </div>

      <template v-else-if="results.length > 0">
        <div v-for="place in results" :key="place.id" class="mb-3 last:mb-0">
          <div
            class="p-3 border-[2px] border-[#2C2C2C] rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.1)] transition-all bg-white group"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg border-[2px] border-[#2C2C2C] flex items-center justify-center bg-[#9BCCC4] flex-shrink-0"
                >
                  <MapPin class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
                </div>
                <div>
                  <h4 class="font-black text-[12px] text-[#2C2C2C] leading-tight mb-0.5">
                    {{ place.name }}
                  </h4>
                  <span
                    class="inline-block px-1.5 py-0.5 rounded border-[1.5px] border-gray-200 text-[9px] font-bold text-gray-500"
                  >
                    {{ place.category }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-[10px] font-bold text-gray-500 mb-3 truncate px-1">
              {{ place.address }}
            </p>

            <button
              @click="$emit('add-place', place)"
              class="w-full py-2 flex items-center justify-center gap-1 bg-[#2C2C2C] text-white rounded-lg hover:bg-black transition-colors"
            >
              <Plus class="w-3 h-3" stroke-width="3" />
              <span class="text-[10px] font-bold uppercase tracking-wide">Add to Plan</span>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="py-10 text-center">
        <p class="text-[11px] font-bold text-gray-400">검색 결과가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, MapPin, Plus } from 'lucide-vue-next'

interface Place {
  id: number
  name: string
  address: string
  category: string
  lat: number
  lng: number
}

defineProps<{
  results: Place[]
  isLoading: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'add-place', place: Place): void
}>()
</script>
