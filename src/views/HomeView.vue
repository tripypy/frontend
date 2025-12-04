<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1280px] mx-auto px-4 md:px-8 pb-12">
      <div class="flex gap-8 items-start justify-center">
        <div class="flex-1 max-w-[680px]">
          <div class="space-y-5">
            <template v-for="diary in diaryEntries" :key="diary.id">
              <DiaryFeedItem v-bind="diary" />
            </template>
          </div>

          <div ref="observerTarget" class="h-8 py-8 text-center">
            <div
              v-if="isLoading"
              class="inline-block w-10 h-10 border-[3px] border-[#2C2C2C] border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>

        <div class="hidden lg:block w-[280px] flex-shrink-0 relative">
          <FollowingPanel
            :followers="followers"
            @toggle-follow="toggleFollow"
            @navigate="handleNavigate"
          />
        </div>
      </div>
    </div>

    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // 👈 1. 라우터 import
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue' // 👈 2. 스크롤 버튼 import
import DiaryFeedItem from '@/components/home/DiaryFeedItem.vue'
import FollowingPanel from '@/components/home/FollowingPanel.vue'
import { initialDiaries, initialFollowers } from '@/data/dummy'

const router = useRouter() // 👈 3. 라우터 인스턴스 생성

// 상태 관리
// currentPage는 라우팅에 따라 결정되므로 여기서 ref로 관리할 필요가 줄어들지만,
// Navbar의 active 상태 표시를 위해 prop으로 전달합니다.
const diaryEntries = ref([...initialDiaries])
const followers = ref([...initialFollowers])
const isLoading = ref(false)
const observerTarget = ref<HTMLElement | null>(null)

// 4. 네비게이션 핸들러 (실제 페이지 이동 로직 추가)
const handleNavigate = (page: string) => {
  if (page === 'main') {
    router.push('/') // 홈으로 이동
  } else if (page === 'trips') {
    router.push('/trips') // 여행 계획 페이지로 이동
  } else if (page === 'search') {
    console.log('Search page not implemented yet')
    // router.push('/search')
  } else if (page === 'write') {
    console.log('Write page not implemented yet')
    // router.push('/write')
  }
}

// 팔로우 토글 로직
const toggleFollow = (id: number) => {
  const target = followers.value.find((f) => f.id === id)
  if (target) {
    target.isFollowing = !target.isFollowing
  }
}

// 무한 스크롤 로직
let observer: IntersectionObserver | null = null

const loadMore = () => {
  if (isLoading.value) return
  isLoading.value = true

  setTimeout(() => {
    const newItems = initialDiaries.map((item, idx) => ({
      ...item,
      id: diaryEntries.value.length + idx + 1,
    }))

    diaryEntries.value.push(...newItems)
    isLoading.value = false
  }, 1000)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
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
