<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Settings, Pencil } from 'lucide-vue-next'
import { useNavigate } from '@/composables/common/useNavagation'
import { useAuthStore, type User } from '@/stores/auth'
import { fetchUserProfile, fetchFriends } from '@/services/user' // Keep fetchFriends for modal
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import LogCard from '@/components/log/LogCard.vue'
import ProfileImageModal from '@/components/log/ProfileImageModal.vue'
import FriendsListModal from '@/components/log/FriendsListModal.vue'

const { handleNavigate } = useNavigate()
const authStore = useAuthStore()
const route = useRoute()
const defaultProfileImage = '/default-profile.svg'

const loggedInUser = computed(() => authStore.user)
const profileData = ref<User | null>(null)
const isMyProfile = computed(() => {
  const routeUserId = route.params.userId
  return !routeUserId || (loggedInUser.value && Number(routeUserId) === loggedInUser.value.id)
})

const showProfileModal = ref(false)
const showFriendsModal = ref(false)

const isEditMode = ref(false)
const editableNickname = ref('')
const editableBio = ref('')

watchEffect(async () => {
  const routeUserId = route.params.userId
  isEditMode.value = false; // Reset edit mode on route change
  if (isMyProfile.value) {
    profileData.value = loggedInUser.value
  } else {
    profileData.value = await fetchUserProfile(Number(routeUserId))
  }
})

watch(profileData, (newProfile) => {
  if (newProfile) {
    editableNickname.value = newProfile.nickname
    editableBio.value = newProfile.bio || ''
  }
}, { immediate: true })

async function handleSave() {
  if (!isMyProfile.value || !profileData.value) return;

  const payload: { nickname?: string; bio?: string } = {};
  if (editableNickname.value !== profileData.value.nickname) {
    payload.nickname = editableNickname.value;
  }
  if (editableBio.value !== (profileData.value.bio || '')) {
    payload.bio = editableBio.value;
  }

  if (Object.keys(payload).length > 0) {
    const success = await authStore.updateUserProfile(payload);
    if (success) {
      isEditMode.value = false
      alert('프로필이 업데이트되었습니다.')
    } else {
      alert('프로필 업데이트에 실패했습니다.')
    }
  } else {
    isEditMode.value = false; // No changes, just exit edit mode
  }
}

function handleEnterEditMode() {
  if (profileData.value) {
    editableNickname.value = profileData.value.nickname
    editableBio.value = profileData.value.bio || ''
    isEditMode.value = true
  }
}

function cancelEdit() {
  isEditMode.value = false
  if (profileData.value) {
    editableNickname.value = profileData.value.nickname
    editableBio.value = profileData.value.bio || ''
  }
}

function openFriendsModal() {
  showFriendsModal.value = true;
}

const logs = [
  {
    id: 1,
    title: '성수동 카페 투어 완전 정복 가이드',
    preview:
      '성수동에서 꼭 가봐야 할 핫한 카페 5곳을 직접 다녀왔습니다. 대림창고부터 숨겨진 감성 카페까지!',
    date: '2024.11.20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    tags: ['성수동', '카페투어', '서울여행'],
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 234,
    comments: 45,
  },
  // ... other logs
]
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar :current-page="'log'" @navigate="handleNavigate" />

    <div v-if="profileData" class="pt-40 max-w-[1200px] mx-auto px-6 pb-20">
      <div
        class="bg-white border-[4px] border-[#2C2C2C] rounded-[30px] p-6 md:p-8 mb-12 shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] flex flex-col md:flex-row items-center md:items-start gap-6"
      >
        <div class="relative flex-shrink-0">
          <div
            class="w-24 h-24 md:w-28 md:h-28 rounded-full border-[4px] border-[#2C2C2C] overflow-hidden bg-gray-100"
          >
            <img
              :src="profileData.profileImageUrl || defaultProfileImage"
              alt="Profile"
              class="w-full h-full object-cover"
            />
          </div>
          <button
            v-if="isMyProfile && isEditMode"
            @click="showProfileModal = true"
            class="absolute bottom-0 right-0 w-8 h-8 bg-[#9BCCC4] border-[3px] border-[#2C2C2C] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            <Pencil class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
          </button>
        </div>

        <div class="flex-1 text-center md:text-left">
          <div v-if="isEditMode && isMyProfile" class="mb-3">
             <label for="nickname" class="text-xs font-bold text-gray-500">닉네임</label>
             <input
              type="text"
              id="nickname"
              v-model="editableNickname"
              class="w-full mt-1 p-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#9BCCC4] focus:border-[#9BCCC4] transition"
            />
          </div>
          <div v-else class="flex items-center gap-2 mb-3 justify-center md:justify-start">
            <h1 class="text-2xl font-black text-[#2C2C2C] font-sans">
              {{ profileData.nickname || '여행자' }}
            </h1>
          </div>

          <div v-if="isEditMode && isMyProfile" class="mb-4">
            <label for="bio" class="text-xs font-bold text-gray-500">소개</label>
            <textarea
              id="bio"
              v-model="editableBio"
              class="w-full mt-1 p-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#9BCCC4] focus:border-[#9BCCC4] transition"
              rows="3"
              placeholder="자신을 소개하는 글을 작성해주세요."
            ></textarea>
          </div>
          <p v-else class="text-sm font-bold text-gray-600 mb-4 whitespace-pre-line leading-relaxed">
            {{ profileData.bio || '자기소개가 없습니다.' }}
          </p>

          <div class="flex items-center justify-center md:justify-start gap-6">
            <div class="text-center">
              <span class="block text-lg font-black text-[#2C2C2C]">{{ logs.length }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Logs</span>
            </div>
            <div class="w-[2px] h-6 bg-gray-200"></div>
            <button @click="openFriendsModal()" class="text-center" title="친구 목록 보기">
              <span class="block text-lg font-black text-[#2C2C2C]">{{ profileData.friendsCount }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Friends</span>
            </button>
          </div>
        </div>

        <div v-if="isMyProfile" class="hidden md:flex flex-col gap-2">
          <button
            v-if="!isEditMode"
            @click="handleEnterEditMode"
            class="px-5 py-2 border-[3px] rounded-xl font-bold text-xs transition-colors shadow-[4px_4px_0px_0px_rgba(150,150,150,1)] bg-black text-white border-black hover:bg-[#2C2C2C]"
          >
            프로필 편집
          </button>
          <template v-if="isEditMode">
            <button
              @click="handleSave"
              class="px-5 py-2 border-[3px] rounded-xl font-bold text-xs transition-colors shadow-[4px_4px_0px_0px_rgba(150,150,150,1)] bg-green-500 text-white border-green-600 hover:bg-green-600"
            >
              저장
            </button>
            <button
              @click="cancelEdit"
              class="px-5 py-2 border-[3px] border-gray-400 text-gray-600 bg-white rounded-xl font-bold text-xs transition-colors hover:bg-gray-100"
            >
              취소
            </button>
          </template>
        </div>
      </div>

      <div class="flex items-end justify-between mb-8 px-2">
        <div>
          <h2 class="text-4xl font-black text-[#2C2C2C] font-sans mb-2 uppercase">My Records</h2>
          <div class="h-[4px] w-20 bg-[#2C2C2C]"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        <LogCard v-for="log in logs" :key="log.id" :log="log" />
      </div>
    </div>
     <div v-else class="pt-40 text-center">
      <p class="text-lg font-bold text-gray-600">사용자 정보를 불러오는 중...</p>
    </div>
    <ScrollToTop />
    <ProfileImageModal :show="showProfileModal" @close="showProfileModal = false" />
    <FriendsListModal 
        :show="showFriendsModal" 
        :user-id="profileData.id" 
        @close="showFriendsModal = false" 
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
</style>
