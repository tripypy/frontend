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
                 {{ truncateUrl(localPlace.website) }}
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
                      <div v-for="i in 5" :key="i" class="relative w-4 h-4">
                        <Star class="absolute inset-0 w-4 h-4 text-gray-200 fill-gray-200" stroke-width="1.5" />
                        <div class="absolute inset-0 overflow-hidden" :style="{ width: `${Math.max(0, Math.min(100, (localPlace.rating - (i - 1)) * 100))}%` }">
                            <Star class="absolute left-0 w-4 h-4 fill-[#FFD60A] text-[#2C2C2C]" stroke-width="1.5" />
                        </div>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-gray-500">{{ localPlace.reviews.toLocaleString() }} Reviews</span>
                 </div>
                 
                 <div class="hidden sm:block w-[2px] self-stretch bg-gray-100"></div>
                 
                 <div class="flex-1 w-full flex flex-col items-end">
                    <p class="text-sm font-black text-gray-800 mb-2 w-full text-left">
                        이 장소는 나에게 어떤 곳이었나요? 기록을 남겨주세요!
                    </p>
                    <div class="flex items-center gap-1 cursor-pointer mb-3 w-full" @mouseleave="handleStarLeave">
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
                    <div class="relative w-full">
                      <textarea
                        v-model="reviewContent"
                        placeholder="솔직한 리뷰를 남겨주세요."
                        class="w-full p-3 border-[2px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#2C2C2C] resize-none h-24 placeholder:text-gray-400"
                      ></textarea>
                      <button 
                        @click="submitReview"
                        :disabled="userRating === 0"
                        class="absolute bottom-3 right-3 px-4 py-1.5 bg-[#2C2C2C] text-white text-xs font-black rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#404040] transition-colors"
                      >
                        {{ myReview ? '수정하기' : '등록하기' }}
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
               <div v-if="reviews.length === 0" class="bg-white border-[2px] border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <p class="text-gray-500 font-bold">아직 작성된 리뷰가 없습니다.<br/>첫 번째 리뷰를 남겨보세요!</p>
               </div>
               <div v-for="review in reviews" :key="review.id" class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-4">
                  <div class="flex justify-between items-start mb-3">
                     <div class="flex items-center gap-3">
                        <!-- Avatar -->
                        <div class="w-10 h-10 rounded-full bg-[#FFF8ED] border-[2px] border-[#2C2C2C] flex items-center justify-center overflow-hidden">
                           <img :src="review.userProfileImage || `https://i.pravatar.cc/150?u=${review.userNickname}`" class="w-full h-full object-cover" />
                        </div>
                        <div>
                           <div class="font-black text-sm text-[#2C2C2C]">{{ review.userNickname }}</div>
                           <div class="text-xs font-bold text-gray-400">{{ formatDate(review.createdAt) }}</div>
                        </div>
                     </div>
                     <div class="flex items-center gap-1 px-2 py-1 bg-[#FFF8ED] rounded-lg border border-[#2C2C2C]">
                        <Star class="w-3 h-3 fill-[#FFD60A] text-[#2C2C2C]" stroke-width="2" />
                        <span class="text-xs font-black">{{ review.rating.toFixed(1) }}</span>
                     </div>
                  </div>
                  <p class="text-sm font-medium text-gray-700 leading-relaxed">
                    {{ review.content }}
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
import { ref, computed, onMounted } from 'vue'
import { X, MapPin, Phone, Globe, Star } from 'lucide-vue-next'
import { spotApi, type SpotRequestDto, type SpotResponseDto } from '@/apis/spot'
import { spotReviewApi, type SpotReviewResponseDto } from '@/apis/spot-review'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  place: any
}>()

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const spotId = ref<number | null>(null)
const spotResponse = ref<SpotResponseDto | null>(null)
const reviews = ref<SpotReviewResponseDto[]>([])
const reviewStats = ref<{ averageRating: number; reviewCount: number }>({
  averageRating: 0,
  reviewCount: 0,
})

const myReview = ref<SpotReviewResponseDto | null>(null)

const localPlace = computed(() => {
  const base = {
    name: props.place.name,
    tags: props.place.tags || [],
    address: props.place.location || props.place.address,
    phone: props.place.phone,
    website: props.place.website || props.place.placeUrl,
  }

  // API 응답이 있으면 덮어쓰기 (실제 DB 데이터 우선)
  if (spotResponse.value) {
      if (spotResponse.value.name) base.name = spotResponse.value.name
  }

  return {
    ...base,
    rating: reviewStats.value.averageRating,
    reviews: reviewStats.value.reviewCount
  }
})


// 사용자 평가 state
const userRating = ref<number>(0)
const hoverRating = ref<number>(0)
const reviewContent = ref<string>('')

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

const fetchSpotData = async () => {
    try {
        // 1. 해당 장소가 이미 등록되어 있는지 조회
        let spot = await spotApi.getSpotByKakaoPlaceId(props.place.kakaoPlaceId)

        // 2. 등록되어 있지 않다면 생성
        if (!spot) {
             const createData: SpotRequestDto = {
                kakaoPlaceId: props.place.kakaoPlaceId,
                name: props.place.name,
                address: props.place.location || props.place.address || '',
                category: props.place.category || '기타',
                lat: props.place.lat || 0,
                lng: props.place.lng || 0,
                placeUrl: props.place.placeUrl || '',
                thumbnailUrl: ''
            }
            spot = await spotApi.createSpot(createData)
        }

        if (spot) {
            spotId.value = spot.id
            spotResponse.value = spot
            
            // 3. 리뷰 및 통계 조회
            const [reviewsData, statsData] = await Promise.all([
                spotReviewApi.getSpotReviews(spot.id),
                spotReviewApi.getSpotReviewStats(spot.id)
            ])

            // New API response structure: { myReview, reviews }
            reviews.value = reviewsData.reviews || []
            myReview.value = reviewsData.myReview
            reviewStats.value = statsData
            
            // If myReview exists but is not in reviews list, add it (so user sees it in the list too)
            if (myReview.value) {
                const exists = reviews.value.find(r => r.id === myReview.value?.id)
                if (!exists) {
                    reviews.value.unshift(myReview.value)
                }
            }

            // Populate input if myReview exists
            if (myReview.value) {
                userRating.value = myReview.value.rating
                reviewContent.value = myReview.value.content
            } else {
                // Reset inputs if no review
                userRating.value = 0
                reviewContent.value = ''
            }
        }

    } catch (e) {
        console.error('Failed to fetch spot data:', e)
    }
}

const submitReview = async () => {
    if (userRating.value === 0 || !spotId.value) return
    
    try {
        if (myReview.value) {
            // Update existig review using PATCH
             await spotReviewApi.updateSpotReview(myReview.value.id, {
                rating: userRating.value,
                content: reviewContent.value
            })
            alert('리뷰가 수정되었습니다!')
        } else {
            // Create new review
            await spotReviewApi.postSpotReview({
                spotId: spotId.value,
                rating: userRating.value,
                content: reviewContent.value
            })
            alert('리뷰가 등록되었습니다!')
        }
        
        // Refresh
        if (!myReview.value) {
            // Clear inputs if it was a new review
            reviewContent.value = ''
            userRating.value = 0
        }
        
        await fetchSpotData()

    } catch (e) {
        console.error('Failed to submit review:', e)
        alert('리뷰 저장에 실패했습니다.')
    }
}

// Helper to format date
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
}

// Helper to truncate URL
const truncateUrl = (url: string) => {
  if (!url) return ''
  return url.length > 30 ? url.substring(0, 30) + '...' : url
}

onMounted(() => {
    fetchSpotData()
})
</script>

<style scoped>
</style>
