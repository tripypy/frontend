<template>
  <div class="min-h-screen bg-[#F5F5F5] font-sans">
    <TravelNavbar @navigate="handleNavigate" />

    <div class="pt-24 max-w-4xl mx-auto px-4 pb-20">
      <div v-if="isLoading" class="flex justify-center items-center h-[60vh]">
         <div class="w-12 h-12 border-[4px] border-[#2C2C2C] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center h-[60vh] text-center">
        <p class="text-xl font-black text-red-500 mb-4">{{ error }}</p>
        <button
          @click="router.back()"
          class="px-6 py-2 bg-[#2C2C2C] text-white rounded-lg font-bold hover:bg-black transition-colors"
        >
          돌아가기
        </button>
      </div>

      <div v-else-if="tripLog && tripDetail" class="bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(44,44,44,0.1)] overflow-hidden border-[2px] border-[#2C2C2C]">
        <!-- Header -->
        <div class="px-6 py-5 border-b-[2px] border-[#F0F0F0] bg-white flex items-center justify-between">
           <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" @click="navigateToUserLog(tripLog!.authorId)">
             <div class="w-12 h-12 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden">
               <img :src="tripLog.authorImageUrl" :alt="tripLog.authorNickname" class="w-full h-full object-cover" />
             </div>
             <div>
                <h4 class="font-black text-lg text-[#2C2C2C]">{{ tripLog.authorNickname }}</h4>
                <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <span>{{ tripLog.locationSummary }}</span>
                  <span>•</span>
                  <span>{{ tripLog.createdAt.substring(0, 10) }}</span>
                </div>
             </div>
           </div>
           
           <!-- Share Button -->
           <button @click="handleShare" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 class="w-5 h-5 text-[#2C2C2C]" />
           </button>
        </div>

        <!-- Content -->
        <div class="min-h-[500px]">
          <TripLogContent
            :log-detail="tripLog"
            :trip-detail="tripDetail"
            :initial-liked="isLiked"
            :show-header="false"
            layout="vertical"
            @update-like="handleUpdateLike"
            @login-required="isLoginAlertVisible = true"
            @refresh-comments="fetchData"
          />
        </div>
      </div>
    </div>
    
    <AlertDialog
      :is-open="isLoginAlertVisible"
      title="로그인 필요"
      message="로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?"
      confirm-text="로그인"
      cancel-text="취소"
      @confirm="handleLoginConfirm"
      @cancel="isLoginAlertVisible = false"
      @close="isLoginAlertVisible = false"
    />

    <!-- Toast for copy link -->
     <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-[-20px]"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-[-20px]"
    >
      <div
        v-if="showToast"
        class="fixed top-24 right-6 z-[60] bg-white border-[3px] border-[#2C2C2C] rounded-xl shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] px-5 py-3 flex items-center gap-3"
      >
         <span class="font-black text-sm text-[#2C2C2C]">링크가 복사되었습니다!</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import TripLogContent from '@/components/trip-log/TripLogContent.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import { useNavigate } from '@/composables/common/useNavagation'
import { getTripLogDetail, getTripLogLikeStatus } from '@/apis/trip-log/index'
import { getTripDetail } from '@/apis/trip/index'
import { Share2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { TripLogDetail } from '@/types/trip/trip.model'
import type { TripDetailResponseDto } from '@/apis/trip/types'

const route = useRoute()
const router = useRouter()
const { handleNavigate } = useNavigate()
const authStore = useAuthStore()

const logId = Number(route.params.logId)
const isLoading = ref(true)
const error = ref<string | null>(null)
const tripLog = ref<TripLogDetail | null>(null)
const tripDetail = ref<TripDetailResponseDto | null>(null)
const isLiked = ref(false)
const isLoginAlertVisible = ref(false)
const showToast = ref(false)

const fetchData = async () => {
    isLoading.value = true
    error.value = null
    try {
        const [logRes, likeRes] = await Promise.all([
            getTripLogDetail(logId),
            authStore.user ? getTripLogLikeStatus(logId) : Promise.resolve({ liked: false })
        ])
        
        tripLog.value = {
            ...logRes,
            logId: logId, // ensure ID
             authorId: logRes.authorId || 0
        }
        isLiked.value = likeRes.liked

        if (logRes.tripId) {
            tripDetail.value = await getTripDetail(logRes.tripId)
        }
    } catch (e: any) {
        console.error('Fetch Log Detail Error:', e)
         if (e?.response?.status === 404) {
             error.value = '존재하지 않는 게시글입니다.'
         } else if (e?.response?.status === 403) {
             error.value = '접근 권한이 없는 게시글입니다.'
         } else {
             error.value = '데이터를 불러오는데 실패했습니다.'
         }
    } finally {
        isLoading.value = false
    }
}

const handleUpdateLike = (payload: { logId: number; likeCount: number; liked: boolean }) => {
    if (tripLog.value) {
        tripLog.value.likeCount = payload.likeCount
        isLiked.value = payload.liked
    }
}

const navigateToUserLog = (userId: number) => {
    router.push({ name: 'user-log', params: { userId } })
}

const handleLoginConfirm = () => {
  isLoginAlertVisible.value = false
  router.push({ name: 'login' })
}

const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
        showToast.value = true
        setTimeout(() => showToast.value = false, 2000)
    })
}

onMounted(fetchData)
</script>

<style scoped>
/* No specific styles needed */
</style>
