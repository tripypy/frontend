<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigate } from '@/composables/common/useNavagation'
import { useAuthStore} from '@/stores/auth'
import apiClient from '@/apis/http'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import FriendsListModal from '@/components/log/FriendsListModal.vue'
import MyPageProfile from '@/components/log/MyPageProfile.vue'
import LogMapWidget from '@/components/log/LogMapWidget.vue'
import LogCalendarWidget from '@/components/log/LogCalendarWidget.vue'
import LogAiAnalysis from '@/components/log/LogAiAnalysis.vue'
import LogContentTabs from '@/components/log/LogContentTabs.vue'
import type { TripDetailResponseDto, TripPlanResponseDto, TripDiaryResponseDto } from '@/apis/trip/types'
import type { User } from '@/types/auth/user.model'

// A more comprehensive user profile type, assuming this structure from the backend
interface PublicUserProfile extends User {
  completedTrips: TripDetailResponseDto[];
  userPlans: TripPlanResponseDto[];
  diaries: TripDiaryResponseDto[];
}

const { handleNavigate } = useNavigate()
const authStore = useAuthStore()
const route = useRoute()

const loggedInUser = computed(() => authStore.user)
const profileData = ref<PublicUserProfile | null>(null)
const isLoading = ref(true)

const isMyProfile = computed<boolean>(() => {
  const routeUserId = route.params.userId
  return !!(!routeUserId || (loggedInUser.value && Number(routeUserId) === loggedInUser.value.id))
})

const showFriendsModal = ref(false)

const fetchAndSetProfileData = async (userId: number) => {
  isLoading.value = true
  try {
    const response = await apiClient.get<PublicUserProfile>(`/user/${userId}/profile`);
    profileData.value = response.data
  } catch (error) {
    console.error(`Failed to fetch profile for user ${userId}:`, error);
    profileData.value = null
  } finally {
    isLoading.value = false
  }
}

const setMyProfileData = async () => {
    isLoading.value = true
    if (!loggedInUser.value) {
        profileData.value = null;
        isLoading.value = false;
        return;
    };

    try {
        const response = await apiClient.get<PublicUserProfile>(`/user/${loggedInUser.value.id}/profile`);
        profileData.value = response.data;
    } catch (error) {
        console.error('내 프로필 정보를 가져오는 데 실패했습니다.', error);
        profileData.value = null;
    } finally {
        isLoading.value = false;
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
           <LogAiAnalysis v-if="profileData" :user-id="profileData.id" />
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
