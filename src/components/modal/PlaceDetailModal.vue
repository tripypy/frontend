<template>
  <div class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" @click="emit('close')">
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none">
      <div
        class="bg-white border-[3px] border-[#2C2C2C] rounded-2xl shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] max-w-2xl w-full max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden"
        @click.stop
      >
        <!-- Header Section -->
        <div class="p-6 border-b-[3px] border-[#2C2C2C] bg-white relative">
          <button
            @click="emit('close')"
            class="absolute top-6 right-6 p-2 border-[2px] border-[#2C2C2C] rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <X class="w-5 h-5 text-[#2C2C2C]" stroke-width="2" />
          </button>

          <div class="pr-12">
             <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="(tag, index) in localPlace.tags"
                :key="index"
                class="px-2.5 py-1 border-[2px] border-[#2C2C2C] rounded-full bg-[#9BCCC4] text-xs font-black text-[#2C2C2C]"
              >
                #{{ tag }}
              </span>
            </div>
            <h2 class="text-3xl font-black tracking-tight font-sans text-[#2C2C2C] leading-tight mb-2">
              {{ localPlace.name }}
            </h2>
          </div>
          
          <!-- Compact Info Bar -->
           <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-gray-600 mt-4">
             <div class="flex items-center gap-1.5">
               <MapPin class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
               <span class="truncate max-w-[200px]">{{ localPlace.address || '주소 정보 없음' }}</span>
             </div>
             
             <div v-if="localPlace.phone" class="flex items-center gap-1.5">
               <Phone class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
               <span>{{ localPlace.phone }}</span>
             </div>
             
             <div v-if="localPlace.website" class="flex items-center gap-1.5">
               <Globe class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
               <a :href="localPlace.website" target="_blank" class="hover:text-[#E88555] hover:underline truncate max-w-[150px]">
                 웹사이트
               </a>
             </div>
           </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-[#FAFAFA]">
          <div class="p-6">
            <!-- Reviews Highlight -->
            <div class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-5 mb-6 shadow-[4px_4px_0px_0px_rgba(44,44,44,0.1)]">
               <div class="flex flex-col sm:flex-row gap-6 items-start">
                 <!-- Rating Stats -->
                 <div class="flex flex-col items-center justify-center min-w-[120px] pt-2">
                    <span class="text-5xl font-black text-[#2C2C2C] tracking-tighter">{{ localPlace.rating.toFixed(1) }}</span>
                    <div class="flex gap-0.5 my-1">
                      <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-[#FFD60A] text-[#2C2C2C]" stroke-width="1.5" />
                    </div>
                    <span class="text-xs font-bold text-gray-500">{{ localPlace.reviews.toLocaleString() }} Reviews</span>
                 </div>
                 
                 <div class="hidden sm:block w-[2px] self-stretch bg-gray-100"></div>
                 
                 <!-- Write Review Prompt -->
                 <div class="flex-1 w-full">
                    <p class="text-sm font-black text-gray-800 mb-2">이 장소에서의 경험은 어떠셨나요?</p>
                    <div class="flex items-center gap-1 cursor-pointer mb-3" @mouseleave="handleStarLeave">
                      <div
                        v-for="star in 5"
                        :key="star"
                        class="relative w-8 h-8"
                        @mousemove="(e) => handleStarHover(star - 1, e)"
                        @click="(e) => handleStarClick(star - 1, e)"
                      >
                        <Star class="absolute inset-0 w-8 h-8 text-gray-200 fill-gray-200" stroke-width="2" />
                        <div
                          class="absolute inset-0 overflow-hidden"
                          :style="{ width: `${getStarFillPercent(star - 1)}%` }"
                        >
                           <Star
                            class="absolute left-0 w-8 h-8 fill-[#FFD60A] text-[#2C2C2C]"
                            stroke-width="2"
                          />
                        </div>
                      </div>
                      <span v-if="userRating > 0" class="ml-2 text-sm font-bold text-[#E88555]">
                        {{ userRating.toFixed(1) }}점
                      </span>
                    </div>

                    <!-- Review Text Input -->
                    <div class="relative">
                      <textarea
                        v-model="reviewContent"
                        placeholder="솔직한 리뷰를 남겨주세요. (선택사항)"
                        class="w-full p-3 border-[2px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#2C2C2C] resize-none h-24 placeholder:text-gray-400"
                      ></textarea>
                      <button 
                        @click="submitReview"
                        :disabled="userRating === 0"
                        class="absolute bottom-3 right-3 px-4 py-1.5 bg-[#2C2C2C] text-white text-xs font-black rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors"
                      >
                        등록하기
                      </button>
                    </div>
                 </div>
               </div>
            </div>

            <!-- Review List Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-black uppercase text-[#2C2C2C]">Reviews</h3>
              <div class="flex gap-2">
                 <button class="text-xs font-bold px-3 py-1.5 bg-[#2C2C2C] text-white rounded-full">최신순</button>
                 <button class="text-xs font-bold px-3 py-1.5 bg-white border border-gray-300 text-gray-500 rounded-full hover:border-[#2C2C2C] hover:text-[#2C2C2C]">별점순</button>
              </div>
            </div>

            <!-- Review List -->
            <div class="space-y-4">
               <div v-for="i in 3" :key="i" class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-4">
                  <div class="flex justify-between items-start mb-3">
                     <div class="flex items-center gap-3">
                        <!-- Avatar -->
                        <div class="w-10 h-10 rounded-full bg-[#FFF8ED] border-[2px] border-[#2C2C2C] flex items-center justify-center overflow-hidden">
                           <img :src="`https://i.pravatar.cc/150?u=${i}`" class="w-full h-full object-cover" />
                        </div>
                        <div>
                           <div class="font-black text-sm text-[#2C2C2C]">Traveler_{{i}}</div>
                           <div class="text-xs font-bold text-gray-400">2024.12.{{11-i}}</div>
                        </div>
                     </div>
                     <div class="flex items-center gap-1 px-2 py-1 bg-[#FFF8ED] rounded-lg border border-[#2C2C2C]">
                        <Star class="w-3 h-3 fill-[#FFD60A] text-[#2C2C2C]" stroke-width="2" />
                        <span class="text-xs font-black">5.0</span>
                     </div>
                  </div>
                  <p class="text-sm font-medium text-gray-700 leading-relaxed">
                    분위기가 너무 좋았습니다. 주말에는 사람이 좀 많지만 평일 오후에 가면 여유롭게 즐길 수 있어요. 
                    특히 {{ localPlace.name }}의 시그니처 메뉴는 꼭 드셔보세요! 재방문 의사 100% 입니다.
                  </p>
               </div>
            </div>
            
            <!-- Load More -->
            <button class="w-full mt-6 py-3 border-[2px] border-gray-300 rounded-xl text-sm font-black text-gray-500 hover:border-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-white transition-all">
              더 많은 리뷰 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, MapPin, Phone, Globe, Star } from 'lucide-vue-next'

const props = defineProps<{
  place: any
}>()

const emit = defineEmits(['close'])

const localPlace = computed(() => ({
    name: props.place.name,
    tags: props.place.tags || [],
    address: props.place.location || props.place.address, // SearchView maps address -> location
    phone: props.place.phone,
    website: props.place.website || props.place.placeUrl,
    rating: props.place.rating || 0,
    reviews: props.place.reviews || 0
}))


// 사용자 평가 state
const userRating = ref<number>(0)
const hoverRating = ref<number>(0)
const reviewContent = ref<string>('')

const submitReview = () => {
    if (userRating.value === 0) return
    console.log('Submit review:', { rating: userRating.value, content: reviewContent.value })
    alert('리뷰가 등록되었습니다! (Mock)')
    reviewContent.value = ''
    userRating.value = 0
}

const getAverageRatingRounded = () => {
  return Math.floor(localPlace.value.rating * 2) / 2
}

const handleStarHover = (starIndex: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const width = rect.width
  const rating = x < width / 2 ? starIndex + 0.5 : starIndex + 1
  hoverRating.value = rating
}

const handleStarClick = (starIndex: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const width = rect.width
  const rating = x < width / 2 ? starIndex + 0.5 : starIndex + 1

  if (userRating.value === rating) {
    userRating.value = 0
  } else {
    userRating.value = rating
  }
}

const handleStarLeave = () => {
  hoverRating.value = 0
}

const getStarFillPercent = (starIndex: number) => {
  const displayRating = hoverRating.value || userRating.value || getAverageRatingRounded()
  const starPosition = starIndex + 1

  if (displayRating >= starPosition) {
    return 100
  } else if (displayRating > starIndex) {
    return (displayRating - starIndex) * 100
  } else {
    return 0
  }
}
</script>

<style scoped>
</style>
