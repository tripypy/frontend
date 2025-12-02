<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar :current-page="currentPage" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1280px] mx-auto px-4 md:px-8 pb-12">
      <div class="flex gap-8 items-start justify-center">
        <div class="flex-1 max-w-[680px]">
          <div class="space-y-5">
            <template v-for="(diary, index) in diaryEntries" :key="diary.id">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TravelNavbar from '@/components/TravelNavbar.vue'
import DiaryFeedItem from '@/components/DiaryFeedItem.vue'
import FollowingPanel from '@/components/FollowingPanel.vue'
import { initialDiaries, initialFollowers } from '@/data/dummy'

// 1. 상태 관리
const currentPage = ref<'main' | 'search'>('main')
const diaryEntries = ref([...initialDiaries])
const followers = ref([...initialFollowers])
const isLoading = ref(false)
const observerTarget = ref<HTMLElement | null>(null)

// 2. 네비게이션 핸들러 (TypeScript 에러 해결)
const handleNavigate = (page: string) => {
  // page가 'main'이나 'search'가 아닌 경우도 있을 수 있으므로 타입 단언 혹은 로직 처리
  if (page === 'main' || page === 'search') {
    currentPage.value = page as 'main' | 'search'
  } else {
    console.log(`Navigating to ${page}...`)
    // 'write' 등 다른 페이지 이동 로직 추가 가능
  }
}

// 3. 팔로우 토글 로직
const toggleFollow = (id: number) => {
  const target = followers.value.find((f) => f.id === id)
  if (target) {
    target.isFollowing = !target.isFollowing
  }
}

// 4. 무한 스크롤 로직 (Intersection Observer)
let observer: IntersectionObserver | null = null

const loadMore = () => {
  if (isLoading.value) return
  isLoading.value = true

  // API 호출 시뮬레이션 (1초 딜레이)
  setTimeout(() => {
    // 기존 데이터를 복사해서 id만 바꿔서 추가 (더미 데이터 뻥튀기)
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
