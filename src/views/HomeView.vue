<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1280px] mx-auto px-4 md:px-8 pb-12">
      <div class="flex gap-8 items-start justify-center">
        <div class="flex-1 max-w-[680px]">
          <div class="space-y-5">
            <template v-for="diary in diaryEntries" :key="diary.logId">
              <DiaryFeedItem v-bind="diary" />
            </template>
          </div>

          <div ref="observerTarget" class="h-8 py-8 text-center">
            <div
              v-if="isLoading"
              class="inline-block w-10 h-10 border-[3px] border-[#2C2C2C] border-t-transparent rounded-full animate-spin"
            ></div>
            <p v-else-if="!hasNext" class="text-gray-500">모든 피드를 불러왔습니다.</p>
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
import { useNavigate } from '@/composables/common/useNavagation'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import DiaryFeedItem from '@/components/home/DiaryFeedItem.vue'
import FollowingPanel from '@/components/home/FollowingPanel.vue'
import { initialFollowers } from '@/data/dummy'
import type { TripLogFeedItemDto } from '@/apis/trip-log/types';
import { getTripLogFeed } from '@/apis/trip-log/index';

const { handleNavigate } = useNavigate()

// 상태 관리
const diaryEntries = ref<TripLogFeedItemDto[]>([])
const followers = ref([...initialFollowers])
const isLoading = ref(false)
const observerTarget = ref<HTMLElement | null>(null)
const nextCursor = ref<number | null>(null) // null이면 첫 페이지를 의미
const hasNext = ref(true) // 다음 페이지 존재 여부


// 팔로우 토글 로직
const toggleFollow = (id: number) => {
  const target = followers.value.find((f) => f.id === id)
  if (target) {
    target.isFollowing = !target.isFollowing
  }
}

// 무한 스크롤 로직 : API 호출
const loadMore = async () => {
  // 이미 로딩 중이거나 다음 페이지가 없으면 리턴
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

// 무한 스크롤 Intersection Observer 로직 (유지)
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // 💡 첫 페이지 로드
  loadMore()

  observer = new IntersectionObserver(
    (entries) => {
      // 뷰포트에 타겟이 들어왔고, 다음 페이지가 존재할 때만 loadMore 호출
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
