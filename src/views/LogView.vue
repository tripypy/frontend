<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigate } from '@/composables/common/useNavagation'
import { useAuthStore } from '@/stores/auth'
import { fetchUserProfile, requestFetchUser } from '@/apis/user/index'
import { getTripLogsByUser } from '@/apis/trip-log/index'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import FriendsListModal from '@/components/log/FriendsListModal.vue'
import MyPageProfile from '@/components/log/MyPageProfile.vue'
import LogMapWidget from '@/components/log/LogMapWidget.vue'
import LogCalendarWidget from '@/components/log/LogCalendarWidget.vue'
import LogAiAnalysis from '@/components/log/LogAiAnalysis.vue'
import LogContentTabs from '@/components/log/LogContentTabs.vue'
import { toLogViewProfile } from '@/mappers/userProfile.mapper'
import type { LogViewProfile } from '@/types/user/user.model'


const { handleNavigate } = useNavigate()
const authStore = useAuthStore()
const route = useRoute()

const loggedInUser = computed(() => authStore.user)
const profileData = ref<LogViewProfile | null>(null)
const isLoading = ref(true)

const isMyProfile = computed<boolean>(() => {
  const routeUserId = route.params.userId
  return !!(!routeUserId || (loggedInUser.value && Number(routeUserId) === loggedInUser.value.id))
})

const showFriendsModal = ref(false)

const fetchAndSetProfileData = async (userId: number, showLoading = true) => {
  if (showLoading) isLoading.value = true
  try {
    const response = await fetchUserProfile(userId);
    if (response){
      profileData.value = toLogViewProfile(response, false)
      
      // Fetch rich logs
      try {
        const logsRes = await getTripLogsByUser(userId, { limit: 100 }) // Load enough for preview
        if (logsRes && logsRes.content) {
            profileData.value.diaries = logsRes.content.map((log: any) => ({
                id: log.logId,
                tripId: log.tripId || 0, // tripId might not be in feed dto? Check spec. Spec says tripId is in Detail, but LogFeedDto doesn't explicitly show it in user's pasted spec (TripLogFeedResponseDto). Wait. The pasted spec shows TripLogFeedResponseDto having logId, authorId. No tripId?
                // Actually TripLogFeedResponseDto doesn't show tripId in user's paste.
                // But LogDiaryDto needs tripId for click handler?
                // userLogSummaryDto had tripId.
                // If feed doesn't have tripId, we might lose navigation capability if not careful.
                // Let's assume for now we use 0 or try to preserve if possible.
                // Re-reading spec: TripLogSearchDoc has trip_id. TripLogDetail has tripId.
                // TripLogFeedResponseDto in user paste: logId, authorId, title, content... NO tripId.
                // This is a problem if `handleDiaryClick(card.tripId)` relies on it.
                // LogContentTabs: `handleDiaryClick(card.tripId)`.
                // It calls `getTripDetail(tripId)`.
                // This means the card MUST HAVE tripId.
                // If `TripLogFeedResponseDto` lacks tripId, we can't fully substitute it.
                // But `UserLogSummaryDto` (from profile) HAS `tripId`.
                // Maybe we can merge?
                // Match by logId.
                ...log,
                id: log.logId,
                likes: log.likeCount,
                comments: log.commentCount,
                thumbnailUrl: log.images && log.images.length > 0 ? log.images[0].imageUrl : null,
                // Reserve tripId from existing summary if available
                tripId: profileData.value?.diaries.find(d => d.id === log.logId)?.tripId || 0
            }))
        }
      } catch (e) {
        console.error("Failed to fetch rich logs", e)
      }
    }
  } catch (error) {
    console.error(`Failed to fetch profile for user ${userId}:`, error);
    if (showLoading) profileData.value = null
  } finally {
    if (showLoading) isLoading.value = false
  }
}

const setMyProfileData = async (showLoading = true) => {
    if (showLoading) isLoading.value = true
    if (!loggedInUser.value) {
        profileData.value = null;
        if (showLoading) isLoading.value = false;
        return;
    };

    try {
        const response = await requestFetchUser()
        if (response){
          profileData.value = toLogViewProfile(response, true)
          
           // Fetch rich logs for me
          try {
            const logsRes = await getTripLogsByUser(loggedInUser.value.id, { limit: 100 })
            if (logsRes && logsRes.content) {
                profileData.value.diaries = logsRes.content.map((log: any) => ({
                    ...log,
                    id: log.logId,
                    likes: log.likeCount,
                    comments: log.commentCount,
                     thumbnailUrl: log.images && log.images.length > 0 ? log.images[0].imageUrl : null,
                     tripId: profileData.value?.diaries.find(d => d.id === log.logId)?.tripId || 0
                }))
            }
          } catch (e) {
            console.error("Failed to fetch rich logs for me", e)
          }
        }
    } catch (error) {
        console.error('내 프로필 정보를 가져오는 데 실패했습니다.', error);
        if (showLoading) profileData.value = null;
    } finally {
        if (showLoading) isLoading.value = false;
    }
}

watch(() => route.params.userId, (newUserId, oldUserId) => {
    // This watcher ensures data re-fetches when navigating between different user profiles
    if (newUserId !== oldUserId) {
        const userIdAsNumber = newUserId ? Number(newUserId) : null;

        if (userIdAsNumber && userIdAsNumber !== loggedInUser.value?.id) {
            fetchAndSetProfileData(userIdAsNumber);
        } else {
            // Handles navigating to /log or /log/:myId
            setMyProfileData();
        }
    }
}, { immediate: true }); // `immediate: true` runs the watcher on component mount

onMounted(() => {
    // Initial load logic if the watcher didn't cover it
    if (!route.params.userId) {
        setMyProfileData();
    }
})

</script>

<template>
  <div class="bg-[#F5F5F5] min-h-screen font-sans">
    <TravelNavbar :current-page="'log'" @navigate="handleNavigate" />

    <main v-if="!isLoading && profileData" class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Sidebar -->
        <aside class="lg:col-span-1 flex flex-col gap-8">
          <MyPageProfile
            :profile-data="profileData"
            :is-my-profile="isMyProfile"
            :diary-count="profileData.diaries?.length || 0"
            @open-friends-modal="showFriendsModal = true"
            @profile-updated="setMyProfileData"
          />
          <LogMapWidget :completed-trips="profileData.completedTrips || []" />
          <LogCalendarWidget :completed-trips="profileData.completedTrips || []" />
        </aside>

        <!-- Right Content Area -->
        <section class="lg:col-span-2 flex flex-col gap-8">
          <LogAiAnalysis
            v-if="profileData"
            :initial-summary="profileData?.travelStyleSummary"
            :is-my-profile="isMyProfile"
            @analysis-completed="setMyProfileData(false)"
          />
          <LogContentTabs
            :is-my-profile="isMyProfile"
            :user-diaries="profileData.diaries || []"
            :user-plans="profileData.userPlans || []"
          />
        </section>
      </div>
    </main>

    <div v-else class="pt-40 text-center">
      <p class="text-lg font-bold text-gray-600">
        {{ isLoading ? '사용자 정보를 불러오는 중...' : '사용자 정보를 찾을 수 없습니다.' }}
      </p>
    </div>

    <ScrollToTop />
    <FriendsListModal
        v-if="profileData"
        :show="showFriendsModal"
        :user-id="profileData.id"
        @close="showFriendsModal = false"
    />
  </div>
</template>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
