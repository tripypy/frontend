<template>
  <nav class="fixed top-0 left-0 right-0 bg-white border-b-[2px] border-[#2C2C2C] z-50">
    <div class="max-w-[1600px] mx-auto px-8 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-12">
          <h1
            class="text-6xl cursor-pointer tracking-tighter hover:scale-105 transition-transform text-[#2C2C2C]"
            style="font-family: 'Bebas Neue', sans-serif; line-height: 0.8"
            @click="emit('navigate', 'main')"
          >
            TRAVEL<span class="text-[#9BCCC4]">.</span>
          </h1>

          <div class="flex items-center gap-2">
            <button
              v-for="menu in menus"
              :key="menu.id"
              @click="emit('navigate', menu.id as any)"
              :class="[
                'flex items-center gap-2 px-5 py-2.5 border-[2px] rounded-full text-sm tracking-tight transition-all uppercase focus:outline-none font-bold',
                currentPage === menu.id
                  ? 'bg-[#2C2C2C] text-white border-[#2C2C2C] shadow-[2px_2px_0px_0px_rgba(44,44,44,1)]'
                  : 'bg-white border-[#2C2C2C] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px]',
              ]"
            >
              <component :is="menu.icon" class="w-4 h-4" stroke-width="2.5" />
              <span>{{ menu.label }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative" ref="notificationRef">
            <button
              @click="showNotifications = !showNotifications"
              class="relative w-11 h-11 bg-white border-[2px] rounded-full border-[#2C2C2C] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all focus:outline-none"
            >
              <Bell class="w-5 h-5" stroke-width="2.5" />
              <span
                class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#E88555] border-[2px] border-white rounded-full"
              ></span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 mt-4 w-96 bg-white border-[3px] border-[#2C2C2C] shadow-[6px_6px_0px_0px_rgba(44,44,44,0.15)] rounded-2xl overflow-hidden z-50"
            >
              <div class="p-5 border-b-[2px] border-[#2C2C2C] bg-[#FFF8ED]">
                <h3
                  class="font-black text-lg uppercase"
                  style="font-family: 'Bebas Neue', sans-serif"
                >
                  Notifications
                </h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="p-4 hover:bg-[#FFF8ED] cursor-pointer transition-colors border-b-[1px] border-gray-200 last:border-0"
                >
                  <div class="flex gap-3">
                    <div
                      class="w-10 h-10 border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        :src="notif.avatar"
                        :alt="notif.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-sm font-bold leading-relaxed"
                        v-html="highlightMessage(notif.message, notif.type)"
                      ></p>
                      <p class="text-xs font-bold text-gray-500 mt-1">{{ notif.time }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="relative" ref="userMenuRef">
            <button
              @click="showUserMenu = !showUserMenu"
              class="w-11 h-11 bg-white border-[2px] rounded-full border-[#2C2C2C] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all overflow-hidden p-0 focus:outline-none"
            >
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
                alt="User profile"
                class="w-full h-full object-cover"
              />
            </button>

            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-4 w-72 bg-white border-[3px] border-[#2C2C2C] shadow-[6px_6px_0px_0px_rgba(44,44,44,0.15)] rounded-2xl overflow-hidden z-50"
            >
              <div class="p-5 border-b-[2px] border-[#2C2C2C] bg-[#FFF8ED]">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-12 h-12 border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
                      alt="User profile"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p class="font-black text-base">여행자님</p>
                    <p class="text-xs font-bold text-gray-600">@traveler</p>
                  </div>
                </div>
              </div>
              <div class="p-2">
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FFF8ED] transition-colors text-left border-[2px] border-transparent hover:border-[#2C2C2C] font-bold"
                >
                  <Settings class="w-5 h-5" stroke-width="2" />
                  <span class="text-sm">마이 페이지</span>
                </button>
              </div>
              <div class="p-2 border-t-[2px] border-gray-200">
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left border-[2px] border-transparent hover:border-red-300 font-bold"
                >
                  <LogOut class="w-5 h-5 text-red-600" stroke-width="2" />
                  <span class="text-sm text-red-600">로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// ... (기존 script 코드와 동일)
import { ref, onMounted, onUnmounted } from 'vue'
import { Home, Search, Map, PenTool, Bell, Settings, User, LogOut, MapPin } from 'lucide-vue-next'

defineProps<{
  currentPage: 'main' | 'search' | 'trips' | 'write'
}>()

const emit = defineEmits<{
  (e: 'navigate', page: 'main' | 'search' | 'trips' | 'write'): void
}>()

const menus = [
  { id: 'main', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'trips', label: 'Trips', icon: Map },
  { id: 'write', label: 'Write', icon: PenTool },
]

const showUserMenu = ref(false)
const showNotifications = ref(false)
const userMenuRef = ref<HTMLDivElement | null>(null)
const notificationRef = ref<HTMLDivElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
  if (notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const notifications = [
  {
    id: 1,
    name: '김민수',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    message: '김민수님이 회원님을 팔로우하기 시작했습니다.',
    time: '5분 전',
    type: 'follow',
  },
  {
    id: 2,
    name: '이서연',
    avatar: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=100&h=100&fit=crop',
    message: '이서연님이 회원님의 게시물에 좋아요를 눌렀습니다.',
    time: '1시간 전',
    type: 'like',
  },
  {
    id: 3,
    name: '박지훈',
    avatar: 'https://images.unsplash.com/photo-1648415041078-d5b259c683be?w=100&h=100&fit=crop',
    message: '박지훈님이 댓글을 남겼습니다: "정보 감사합니다!"',
    time: '2시간 전',
    type: 'comment',
  },
  {
    id: 4,
    name: '최유진',
    avatar: 'https://images.unsplash.com/photo-1609043238951-9bb29775f27c?w=100&h=100&fit=crop',
    message: '최유진님이 회원님의 여행 계획을 저장했습니다.',
    time: '1일 전',
    type: 'save',
  },
]

const highlightMessage = (message: string, type: string) => {
  let highlighted = message
  highlighted = highlighted.replace(/^([가-힣]+)/, '<span class="font-black">$1</span>')
  if (type === 'follow') {
    highlighted = highlighted.replace(
      '팔로우',
      '<span class="font-black text-[#5AB5A8]">팔로우</span>',
    )
  } else if (type === 'like') {
    highlighted = highlighted.replace(
      '좋아요',
      '<span class="font-black text-[#FF6B9D]">좋아요</span>',
    )
  } else if (type === 'comment') {
    highlighted = highlighted.replace('댓글', '<span class="font-black text-[#6B8FD4]">댓글</span>')
  } else if (type === 'save') {
    highlighted = highlighted.replace('저장', '<span class="font-black text-[#D4A520]">저장</span>')
  }
  return highlighted
}
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
</style>
