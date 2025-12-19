<template>
  <div class="min-h-screen bg-[#F5F5F5] font-sans selection:bg-[#F9CA6B] selection:text-black">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1440px] mx-auto px-6 pb-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Sidebar: Discovery -->
        <div class="hidden lg:block lg:col-span-3 space-y-8">
          
          <!-- Keywords Section -->
          <div class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)]">
            <h3 class="text-xl font-black mb-4 uppercase flex items-center gap-2" style="font-family: 'Bebas Neue', sans-serif">
              <span class="text-[#E88555]">#</span> Trending Now
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="keyword in keywords"
                :key="keyword"
                class="px-3 py-1 bg-[#FFF8ED] border-[2px] border-[#2C2C2C] rounded-lg text-xs font-bold hover:bg-[#F9CA6B] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,1)] transition-all"
              >
                {{ keyword }}
              </button>
            </div>
          </div>

            <h3 class="text-xl font-black mb-4 uppercase flex items-center gap-2" style="font-family: 'Bebas Neue', sans-serif">
              <span class="text-[#9BCCC4]">★</span> Real-time Ranking
            </h3>
            <div class="space-y-3">
              <div v-for="(place, idx) in hotPlaces" :key="idx" class="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors">
                <!-- Rank -->
                <span class="text-lg font-black italic text-[#2C2C2C] w-6 text-center shadow-[2px_2px_0px_0px_rgba(207,245,0,0.5)] bg-white border border-[#2C2C2C] rounded flex-shrink-0">
                  {{ idx + 1 }}
                </span>
                
                <!-- Content -->
                <div class="min-w-0 flex-1">
                   <h4 class="font-bold text-sm truncate text-[#2C2C2C] group-hover:text-[#E88555] transition-colors leading-tight">
                    {{ place.name }}
                  </h4>
                  <p class="text-[10px] text-gray-400 font-bold truncate">
                    {{ place.location }}
                  </p>
                </div>
              </div>
            </div>
            <button class="w-full mt-4 py-2 border-[2px] border-[#2C2C2C] rounded-lg font-black text-xs uppercase hover:bg-[#F5F5F5] transition-colors">
              View Full Chart
            </button>
        </div>

        <!-- Center: Feed -->
        <div class="col-span-1 lg:col-span-6">
          <!-- Feed Header -->
          <div class="mb-8 text-center bg-white border-[2px] border-[#2C2C2C] rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] relative overflow-hidden">
             <!-- Decorative diagonal stripes background -->
             <div class="absolute top-0 right-0 w-32 h-32 opacity-10" style="background-image: radial-gradient(#2C2C2C 2px, transparent 2px); background-size: 10px 10px;"></div>
             
             <h2
              class="text-6xl text-[#2C2C2C] mb-1 relative inline-block z-10"
              style="font-family: 'Bebas Neue', sans-serif"
            >
              TRAVEL LOG
              <span class="absolute -bottom-2 left-0 w-full h-[12px] bg-[#9BCCC4]/40 -z-10 skew-x-[-12deg]"></span>
            </h2>
            <p class="text-sm font-bold text-gray-500 tracking-tight">
              Share your journey with travelers
            </p>
          </div>

          <!-- Feed Items -->
          <div class="space-y-8">
            <template v-for="diary in diaryEntries" :key="diary.logId">
              <DiaryFeedItem v-bind="diary" />
            </template>
          </div>

          <!-- Loading State -->
          <div ref="observerTarget" class="h-12 py-8 text-center flex justify-center">
            <div
              v-if="isLoading"
              class="w-8 h-8 border-[3px] border-[#2C2C2C] border-t-transparent rounded-full animate-spin"
            ></div>
            <p v-else-if="!hasNext" class="px-4 py-1 bg-gray-200 rounded-full text-xs font-bold text-gray-500">
              End of Feed
            </p>
          </div>
        </div>

        <!-- Right Sidebar: Personal -->
        <div class="hidden lg:block lg:col-span-3 space-y-8">
          
          <!-- New Plan Card (CTA) -->
          <button
            @click="handleNavigate('trip')"
            class="w-full bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,1)] transition-all text-left group relative overflow-hidden"
          >
             <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div class="w-12 h-12 bg-[#2C2C2C] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-white/20 group-hover:rotate-12 transition-transform">
              <Plus class="w-6 h-6" stroke-width="3" />
            </div>
            <h3 class="text-2xl font-black text-[#2C2C2C] leading-none mb-1 font-sans">
              NEW PLAN
            </h3>
            <p class="text-xs font-bold text-[#2C2C2C]/80">나만의 여행 계획 만들기</p>
          </button>

          <!-- My Upcoming Trips -->
          <div class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)]">
             <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-black uppercase" style="font-family: 'Bebas Neue', sans-serif">
                My Trips
              </h3>
              <button @click="handleNavigate('trips')" class="text-xs font-bold text-gray-400 hover:text-[#2C2C2C] transition-colors">
                View All →
              </button>
            </div>

            <div v-if="upcomingTrips.length > 0" class="space-y-3">
              <div v-for="trip in upcomingTrips" :key="trip.id" class="group cursor-pointer bg-[#FFF8ED] border-[2px] border-[#2C2C2C] rounded-lg p-3 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,1)] transition-all">
                <div class="flex justify-between items-start mb-2">
                   <div class="flex items-center gap-1.5">
                      <Calendar class="w-3.5 h-3.5 text-gray-500" />
                      <span class="text-xs font-bold text-gray-500">{{ trip.date }}</span>
                   </div>
                   <span class="text-xs font-black bg-[#2C2C2C] text-white px-2 py-0.5 rounded-full">
                      {{ trip.dDay }}
                   </span>
                </div>
                <h4 class="font-black text-sm text-[#2C2C2C] leading-tight truncate group-hover:underline decoration-2 underline-offset-2">
                  {{ trip.title }}
                </h4>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <div class="inline-flex justify-center items-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                <Calendar class="w-5 h-5 text-gray-400" />
              </div>
              <p class="text-xs font-bold text-gray-400">예정된 여행이 없습니다.</p>
            </div>
          </div>

          <!-- Ad / Banner Area -->
          <div class="bg-[#2C2C2C] rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center text-white relative overflow-hidden group cursor-pointer">
            <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h3 class="text-xl font-black mb-2 relative z-10" style="font-family: 'Bebas Neue'">PREMIUM LOG</h3>
            <p class="text-xs font-bold text-gray-400 relative z-10">더 많은 기능을 경험해보세요</p>
            <div class="mt-4 inline-block px-4 py-1.5 border border-white/30 rounded-full text-xs font-bold group-hover:bg-white group-hover:text-[#2C2C2C] transition-all relative z-10">
              Upgrade Now
            </div>
          </div>

        </div>
      </div>
    </div>

    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigate } from '@/composables/common/useNavagation'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import DiaryFeedItem from '@/components/home/DiaryFeedItem.vue'
import { Plus, MapPin, Calendar, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import type { TripLogFeedItemDto } from '@/apis/trip-log/types';
import { getTripLogFeed } from '@/apis/trip-log/index';

const { handleNavigate } = useNavigate()

// 상태 관리
const diaryEntries = ref<TripLogFeedItemDto[]>([])
const isLoading = ref(false)
const observerTarget = ref<HTMLElement | null>(null)
const nextCursor = ref<number | null>(null)
const hasNext = ref(true)

// Mock Data for Sidebars
const keywords = ['성수동','반려견동반','오션뷰','캠핑로그','제주맛집','호캉스','파리올림픽']
import { allPlaces } from '@/data/mockData'

const hotPlaces = allPlaces.slice(0, 10) // Show Top 10

const upcomingTrips = ref([
  { id: 1, title: '여름 휴가 🌊', date: '2024.08.15', dDay: 'D-25' },
  { id: 2, title: '주말 글램핑', date: '2024.07.27', dDay: 'D-4' }
])

// 무한 스크롤 로직
const loadMore = async () => {
  if (isLoading.value || !hasNext.value) return

  isLoading.value = true

  try {
    const response = await getTripLogFeed({
      cursor: nextCursor.value,
      limit: 10
    })

    diaryEntries.value.push(...response.content)
    nextCursor.value = response.nextCursor
    hasNext.value = response.hasNext
  } catch (error) {
    console.error('피드 로딩 중 오류 발생: ', error)
  } finally {
    isLoading.value = false
  }
}

// Observer Logic
let observer: IntersectionObserver | null = null;

onMounted(() => {
  loadMore()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasNext.value) { 
        loadMore()
      }
    },
    { threshold: 1.0 },
  )

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

</script>

<style scoped>
/* Custom Scrollbar for Magazine Feel */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2C2C2C;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
