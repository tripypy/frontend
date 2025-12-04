<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar :current-page="'log'" @navigate="handleNavigate" />

    <div class="pt-40 max-w-[1200px] mx-auto px-6 pb-20">
      <div
        class="bg-white border-[4px] border-[#2C2C2C] rounded-[30px] p-6 md:p-8 mb-12 shadow-[8px_8px_0px_0px_rgba(44,44,44,1)] flex flex-col md:flex-row items-center md:items-start gap-6"
      >
        <div class="relative flex-shrink-0">
          <div
            class="w-24 h-24 md:w-28 md:h-28 rounded-full border-[4px] border-[#2C2C2C] overflow-hidden bg-gray-100"
          >
            <img :src="userProfile.avatar" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <button
            class="absolute bottom-0 right-0 w-8 h-8 bg-[#9BCCC4] border-[3px] border-[#2C2C2C] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            <Settings class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
          </button>
        </div>

        <div class="flex-1 text-center md:text-left">
          <div
            class="flex flex-col md:flex-row md:items-center gap-2 mb-3 justify-center md:justify-start"
          >
            <h1 class="text-2xl font-black text-[#2C2C2C] font-sans">{{ userProfile.name }}</h1>
            <span
              class="px-2 py-0.5 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-full text-[10px] font-black uppercase tracking-wide"
            >
              Traveler
            </span>
          </div>

          <p class="text-sm font-bold text-gray-600 mb-4 whitespace-pre-line leading-relaxed">
            {{ userProfile.bio }}
          </p>

          <div class="flex items-center justify-center md:justify-start gap-6">
            <div class="text-center">
              <span class="block text-lg font-black text-[#2C2C2C]">{{ logs.length }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Logs</span>
            </div>
            <div class="w-[2px] h-6 bg-gray-200"></div>
            <div class="text-center">
              <span class="block text-lg font-black text-[#2C2C2C]">{{
                userProfile.followers
              }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Followers</span>
            </div>
            <div class="w-[2px] h-6 bg-gray-200"></div>
            <div class="text-center">
              <span class="block text-lg font-black text-[#2C2C2C]">{{
                userProfile.following
              }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Following</span>
            </div>
          </div>
        </div>

        <div class="hidden md:block">
          <button
            class="px-5 py-2 bg-black text-white border-[3px] border-black rounded-xl font-bold text-xs hover:bg-[#2C2C2C] transition-colors shadow-[4px_4px_0px_0px_rgba(150,150,150,1)]"
          >
            프로필 편집
          </button>
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
    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useNavigate } from '@/composables/navigation'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import LogCard from '@/components/log/LogCard.vue'

const { handleNavigate } = useNavigate()

// Mock User Profile Data
const userProfile = ref({
  name: '김민준',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  bio: '새로운 곳을 찾아 떠나는 것을 좋아합니다.\n주로 카페 투어와 풍경 사진을 찍습니다. 📸',
  followers: 1240,
  following: 356,
})

// Mock Logs Data
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
  {
    id: 2,
    title: '제주도 서귀포 힐링 여행 3박 4일 코스 추천',
    preview:
      '복잡한 일상을 떠나 제주도 서귀포에서 보낸 힐링 같은 시간. 맛집과 숙소 정보를 공유합니다.',
    date: '2024.11.15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542662565-7792455873ac?w=800',
    tags: ['제주도', '서귀포', '힐링'],
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 189,
    comments: 32,
  },
  {
    id: 3,
    title: '부산 해운대 블루라인파크 탑승 후기',
    preview:
      '해변열차를 타고 바라본 부산의 바다는 정말 아름다웠습니다. 예약 꿀팁과 포토존 위치를 알려드려요.',
    date: '2024.11.10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1569926673473-b3eb27770146?w=800',
    tags: ['부산', '해운대', '블루라인파크'],
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 156,
    comments: 28,
  },
  {
    id: 4,
    title: '강릉 안목해변 커피거리 산책',
    preview: '바다 냄새와 커피 향이 어우러진 강릉 안목해변. 주말 나들이 장소로 추천합니다.',
    date: '2024.11.05',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags: ['강릉', '안목해변', '커피'],
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 98,
    comments: 15,
  },
  {
    id: 5,
    title: '가을 경복궁 야간개장 관람기',
    preview: '가을 밤의 고궁은 낮과는 또 다른 매력이 있습니다. 한복 입고 무료 입장한 후기!',
    date: '2024.10.28',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800',
    tags: ['서울', '경복궁', '야경'],
    author: '김민준',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 312,
    comments: 67,
  },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
</style>
