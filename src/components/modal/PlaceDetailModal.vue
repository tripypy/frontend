<template>
  <div class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" @click="emit('close')">
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none">
      <div
        class="bg-white border-[3px] border-[#2C2C2C] rounded-2xl shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] max-w-2xl w-full max-h-[85vh] overflow-hidden pointer-events-auto"
        @click.stop
      >
        <div class="relative">
          <div class="h-64 border-b-[3px] border-[#2C2C2C] overflow-hidden">
            <img :src="placeData.image" :alt="placeData.name" class="w-full h-full object-cover" />
          </div>
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 p-2.5 border-[2px] border-[#2C2C2C] rounded-lg bg-white hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X class="w-5 h-5 text-[#2C2C2C]" stroke-width="2" />
          </button>
        </div>

        <div class="p-8 overflow-y-auto max-h-[calc(85vh-16rem)]">
          <div
            class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFD60A] border-[3px] border-[#2C2C2C] mb-4"
          >
            <span class="text-lg font-black text-[#2C2C2C]">{{ place.number }}</span>
          </div>

          <h2 class="text-4xl font-black mb-2 tracking-tight font-sans">{{ placeData.name }}</h2>
          <p class="text-sm font-bold text-gray-600 uppercase mb-4">{{ placeData.category }}</p>

          <div class="flex items-center gap-2 mb-6">
            <div class="flex items-center gap-1">
              <Star
                v-for="star in 5"
                :key="star"
                :class="[
                  'w-5 h-5',
                  star <= Math.floor(placeData.rating)
                    ? 'fill-[#FFD60A] text-[#FFD60A]'
                    : 'text-gray-300',
                ]"
                stroke-width="2"
              />
            </div>
            <span class="font-black text-lg">{{ placeData.rating }}</span>
            <span class="text-sm font-bold text-gray-600"
              >({{ placeData.reviews.toLocaleString() }} 리뷰)</span
            >
          </div>

          <p class="text-base leading-relaxed font-medium text-gray-800 mb-6">
            {{ placeData.description }}
          </p>

          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="(tag, index) in placeData.tags"
              :key="index"
              class="px-3 py-1.5 border-[2px] border-[#2C2C2C] rounded-full bg-[#B4E4FF] text-xs font-black uppercase"
            >
              #{{ tag }}
            </span>
          </div>

          <div class="space-y-3 mb-6">
            <div
              class="flex items-start gap-3 p-4 border-[2px] border-[#2C2C2C] rounded-xl bg-[#FFF8ED]"
            >
              <MapPin class="w-5 h-5 text-[#2C2C2C] mt-0.5 flex-shrink-0" stroke-width="2" />
              <div>
                <p class="text-xs font-black uppercase text-gray-600 mb-1">주소</p>
                <p class="font-bold">{{ placeData.address }}</p>
              </div>
            </div>
            <div
              class="flex items-start gap-3 p-4 border-[2px] border-[#2C2C2C] rounded-xl bg-[#FFF8ED]"
            >
              <Clock class="w-5 h-5 text-[#2C2C2C] mt-0.5 flex-shrink-0" stroke-width="2" />
              <div>
                <p class="text-xs font-black uppercase text-gray-600 mb-1">운영시간</p>
                <p class="font-bold">{{ placeData.hours }}</p>
              </div>
            </div>
            <div
              class="flex items-start gap-3 p-4 border-[2px] border-[#2C2C2C] rounded-xl bg-[#FFF8ED]"
            >
              <Phone class="w-5 h-5 text-[#2C2C2C] mt-0.5 flex-shrink-0" stroke-width="2" />
              <div>
                <p class="text-xs font-black uppercase text-gray-600 mb-1">전화번호</p>
                <p class="font-bold">{{ placeData.phone }}</p>
              </div>
            </div>
            <div
              class="flex items-start gap-3 p-4 border-[2px] border-[#2C2C2C] rounded-xl bg-[#FFF8ED]"
            >
              <Globe class="w-5 h-5 text-[#2C2C2C] mt-0.5 flex-shrink-0" stroke-width="2" />
              <div>
                <p class="text-xs font-black uppercase text-gray-600 mb-1">웹사이트</p>
                <p class="font-bold">{{ placeData.website }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, MapPin, Clock, Phone, Globe, Star } from 'lucide-vue-next'

const props = defineProps<{
  place: { number: number; name: string }
}>()

const emit = defineEmits(['close'])

// Mock Data
const placeData = {
  name: props.place.name,
  category: '카페 & 디저트',
  rating: 4.8,
  reviews: 1234,
  address: '서울특별시 성동구 연무장길 74',
  phone: '02-1234-5678',
  hours: '10:00 - 22:00',
  website: 'www.example.com',
  description:
    '성수동 핫플레이스로 유명한 감성 카페입니다. 넓은 공간과 아늑한 분위기, 맛있는 커피와 디저트를 즐길 수 있어요. 특히 시그니처 음료인 얼그레이 라떼와 수제 티라미수가 인기 메뉴입니다.',
  image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  tags: ['카페', '디저트', '감성', '인스타그램', '데이트'],
}
</script>
