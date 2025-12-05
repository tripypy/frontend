<template>
  <div class="bg-white border-b-[3px] border-[#2C2C2C] px-6 py-3 flex-shrink-0">
    <div class="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
      <button
        @click="$emit('back')"
        class="w-9 h-9 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all flex-shrink-0"
        :title="isEditMode ? '취소' : '뒤로가기'"
      >
        <ArrowLeft class="w-4 h-4" stroke-width="2.5" />
      </button>

      <div class="flex-1 max-w-md">
        <input
          v-if="isEditMode"
          :value="tripTitle"
          @input="$emit('update:tripTitle', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="여행 이름을 입력하세요"
          class="w-full px-4 py-2 border-[2px] border-[#2C2C2C] rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#9BCCC4]"
        />
        <div
          v-else
          class="w-full px-4 py-2 border-[2px] border-gray-300 rounded-lg font-bold text-sm bg-gray-50"
        >
          {{ tripTitle }}
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-4 pr-4 border-r-[2px] border-gray-300">
          <div class="flex items-center gap-2 relative">
            <Calendar class="w-5 h-5 text-gray-600" stroke-width="2.5" />
            <template v-if="isEditMode">
              <input
                :value="tripDate"
                @input="$emit('update:tripDate', ($event.target as HTMLInputElement).value)"
                type="date"
                class="px-3 py-1.5 border-[2px] border-[#2C2C2C] rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#9BCCC4] cursor-pointer bg-white text-sm"
              />
            </template>
            <span v-else class="font-bold text-gray-700 text-[15px]">{{ formattedDate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapPin class="w-5 h-5 text-gray-600" stroke-width="2.5" />
            <span class="font-bold text-gray-700 text-[15px]">{{ totalPlacesCount }}개 장소</span>
          </div>
        </div>

        <template v-if="isEditMode">
          <button
            @click="$emit('save')"
            class="flex items-center gap-2 px-4 py-2 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase flex-shrink-0"
          >
            <Save class="w-3.5 h-3.5" stroke-width="3" /> Save
          </button>
        </template>
        <template v-else>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('edit')"
              class="flex items-center gap-2 px-4 py-2 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs tracking-tight shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase flex-shrink-0"
            >
              <Edit class="w-3.5 h-3.5" stroke-width="3" /> Edit
            </button>
            <button
              @click="$emit('delete')"
              class="w-9 h-9 bg-white border-[2px] border-[#2C2C2C] rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all flex-shrink-0"
              title="삭제"
            >
              <Trash2 class="w-4 h-4" stroke-width="2.5" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Calendar, MapPin, Save, Edit, Trash2 } from 'lucide-vue-next'

// 부모에게 받을 데이터
defineProps<{
  tripTitle: string
  tripDate: string
  formattedDate: string
  isEditMode: boolean
  totalPlacesCount: number
}>()

// 부모에게 알릴 이벤트
defineEmits<{
  (e: 'back'): void
  (e: 'save'): void
  (e: 'delete'): void
  (e: 'edit'): void
  (e: 'update:tripTitle', value: string): void
  (e: 'update:tripDate', value: string): void
}>()
</script>
