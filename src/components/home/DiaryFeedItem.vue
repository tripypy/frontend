<template>
  <div class="mb-8 block relative">
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
        class="fixed top-6 right-6 z-[60] bg-white border-[3px] border-[#2C2C2C] rounded-xl shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] px-5 py-3 flex items-center gap-3"
      >
        <div class="w-6 h-6 bg-[#FFD60A] border-[2px] border-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#2C2C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="font-black text-sm text-[#2C2C2C]">링크가 복사되었습니다!</span>
      </div>
    </Transition>
    <div
      class="bg-white border-[2px] border-[#2C2C2C] rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all p-5"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
          <div
            class="w-10 h-10 border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden flex-shrink-0"
          >
            <img :src="props.authorImageUrl" :alt="props.authorNickname" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-black font-sans">{{ props.authorNickname }}</h4>
            <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
              <MapPin class="w-3 h-3 flex-shrink-0" stroke-width="2" />
              <span class="truncate">{{ props.locationSummary }}</span>
              <span>•</span>
              <Calendar class="w-3 h-3 flex-shrink-0" stroke-width="2" />
              <span>{{ props.createdAt }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleShare"
            class="p-2 border-[2px] border-[#2C2C2C] rounded-lg bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] transition-all focus:outline-none"
          >
            <Share2 class="w-3.5 h-3.5 text-gray-600" stroke-width="2.5" />
          </button>
          <button
            @click="isBookmarked = !isBookmarked"
            :class="[
              'p-2 border-[2px] border-[#2C2C2C] rounded-lg transition-all focus:outline-none',
              isBookmarked
                ? 'bg-[#D4A520] shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
                : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]',
            ]"
          >
            <Bookmark
              :class="['w-3.5 h-3.5', isBookmarked ? 'text-white fill-white' : 'text-gray-600']"
              stroke-width="2.5"
            />
          </button>
        </div>
      </div>

      <h3 class="text-lg font-black mb-2.5 tracking-tight leading-tight font-sans">{{ title }}</h3>

      <!-- <div v-if="course && course.length > 0" class="mb-4 flex items-center flex-wrap gap-1.5">
        <div v-for="(place, index) in course" :key="index" class="flex items-center gap-1.5">
          <button
            class="course-badge flex items-center gap-1 px-2.5 py-1 border-[2px] border-[#2C2C2C] rounded-full bg-white shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all focus:outline-none"
            :style="{ '--hover-color': getBadgeColor(index) }"
            @click="selectedPlace = place"
          >
            <span class="text-xs font-black text-[#2C2C2C]">{{ place.number }}</span>
            <span class="text-xs font-black text-[#2C2C2C] whitespace-nowrap">{{
              place.name
            }}</span>
          </button>
          <ChevronRight
            v-if="index < course.length - 1"
            class="w-3 h-3 text-gray-400 flex-shrink-0"
            stroke-width="3"
          />
        </div>
      </div> -->

      <div
        v-if="allImages.length > 0"
        class="mb-4 select-none cursor-pointer"
        @click="showCommentModal = true"
      >
        <div v-if="allImages.length === 1" class="flex justify-center">
          <div class="w-[320px] border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden">
            <img :src="allImages[0]" class="w-full h-[380px] object-cover" />
          </div>
        </div>
        <div v-else-if="allImages.length === 2" class="grid grid-cols-2 gap-2.5">
          <div
            v-for="(img, idx) in allImages"
            :key="idx"
            class="border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden"
          >
            <img
              :src="img"
              class="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
        <div v-else class="relative group">
          <div class="overflow-hidden">
            <div
              class="flex gap-2.5 transition-transform duration-500 ease-in-out will-change-transform"
              :style="{
                transform: `translateX(calc(-${currentImageIndex * 50}% - ${currentImageIndex * 0.3125}rem))`,
              }"
            >
              <div
                v-for="(img, idx) in allImages"
                :key="idx"
                class="w-[calc(50%-0.3125rem)] flex-shrink-0 h-[300px] border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden bg-gray-100"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <button
            v-if="currentImageIndex > 0"
            @click.stop="prevImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border-[2px] border-[#2C2C2C] rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(44,44,44,0.2)] z-10 focus:outline-none"
          >
            <ChevronLeft class="w-5 h-5 text-[#2C2C2C]" stroke-width="2.5" />
          </button>
          <button
            v-if="currentImageIndex + 2 < allImages.length"
            @click.stop="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border-[2px] border-[#2C2C2C] rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(44,44,44,0.2)] z-10 focus:outline-none"
          >
            <ChevronRight class="w-5 h-5 text-[#2C2C2C]" stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="relative mb-4">
        <p
          class="text-sm leading-relaxed font-medium text-gray-800 whitespace-pre-line cursor-pointer hover:opacity-80 transition-opacity"
          :class="{ 'line-clamp-3': !isExpanded }"
          @click="isExpanded = !isExpanded"
          v-html="processedContent"
        >
        </p>
      </div>

      <div class="flex items-center gap-2 pt-4 border-t-[2px] border-gray-200">
        <button
          @click="toggleLike"
          :class="[
            'flex items-center gap-1.5 px-3.5 py-2 border-[2px] border-[#2C2C2C] rounded-full font-black text-xs transition-all uppercase focus:outline-none',
            isLiked
              ? 'bg-[#FF6B9D] text-white shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
              : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px]',
          ]"
        >
          <Heart :class="['w-3.5 h-3.5', isLiked ? 'fill-current' : '']" stroke-width="2.5" />
          <span>{{ currentLikes }}</span>
        </button>

        <button
          @click="showCommentModal = true"
          class="flex items-center gap-1.5 px-3.5 py-2 border-[2px] border-[#2C2C2C] rounded-full font-black text-xs transition-all uppercase bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px] focus:outline-none"
        >
          <MessageCircle class="w-3.5 h-3.5" stroke-width="2.5" />
          <span>{{ props.commentCount }}</span>
        </button>

        <button
          class="ml-auto px-4 py-2 border-[2px] border-[#2C2C2C] rounded-full font-black text-xs bg-[#E88555] text-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase focus:outline-none"
        >
          내 계획에 추가
        </button>
      </div>
    </div>
    <Teleport to="body">
      <DiaryCommentModal
        v-if="showCommentModal"
        :log-id="props.logId"
        @close="showCommentModal = false"
      />

      <PlaceDetailModal v-if="selectedPlace" :place="selectedPlace" @close="selectedPlace = null" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  Calendar,
  Share2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-vue-next'
import DiaryCommentModal from '@/components/modal/DiaryCommentModal.vue'
import PlaceDetailModal from '@/components/modal/PlaceDetailModal.vue'
import type { TripLogFeedItemDto } from '@/apis/trip-log/types';

interface CourseItem {
  number: number
  name: string
}

const props = defineProps<TripLogFeedItemDto>();
// State
const isLiked = ref(props.liked)
const isBookmarked = ref(false)
const currentLikes = ref(props.likeCount)
const isExpanded = ref(false)
const currentImageIndex = ref(0)
const showToast = ref(false)

// Modal States
const showCommentModal = ref(false)
const selectedPlace = ref<CourseItem | null>(null)

// Images Logic
const allImages = computed(() => {
  // props.images가 존재하면, .map을 사용하여 imageUrl 속성만 추출
  if (props.images && props.images.length > 0) {
    return props.images.map(img => img.imageUrl);
  }
  return [];
});
const prevImage = () => {
  currentImageIndex.value = Math.max(0, currentImageIndex.value - 2)
}
const nextImage = () => {
  currentImageIndex.value = Math.min(allImages.value.length - 2, currentImageIndex.value + 2)
}

// Like Action
const toggleLike = () => {
  if (isLiked.value) currentLikes.value--
  else currentLikes.value++
  isLiked.value = !isLiked.value
}

// Share Action
const handleShare = async () => {
  const diaryUrl = `${window.location.origin}/diary/${props.logId}`

  try {
    await navigator.clipboard.writeText(diaryUrl)
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 2500)
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
  }
}

// Course Badge Colors
//const colors = ['#FFD60A', '#FF6B9D', '#98D8C8', '#B4E4FF', '#E88555']
//const getBadgeColor = (idx: number) => colors[idx % colors.length]

const imageMap = computed(() => {
  const map = new Map<string, string>();
  if (props.images) {
    props.images.forEach(img => {
      map.set(img.imageRefKey, img.imageUrl);
    });
  }
  return map;
});

// 2. 본문 내용 처리: 플레이스홀더를 <img> 태그로 대체
const processedContent = computed(() => {
  let text = props.content || '';
  const map = imageMap.value;

  // 정규식을 사용하여 {{img_key_숫자}} 패턴을 찾고 대체합니다.
  text = text.replace(/\{\{img_key_(\d+)\}\}/g, (match, keyIndex) => {
    const refKey = `img_key_${keyIndex}`;

    // 맵에서 해당 키에 맞는 URL을 찾습니다.
    const imageUrl = map.get(refKey);

    if (imageUrl) {
      // 찾았다면 <img> 태그로 대체 (Tailwind CSS 스타일링 적용)
      return `
        <div class="my-3 flex justify-center">
          <img
            src="${imageUrl}"
            alt="첨부 이미지"
            class="w-full max-w-[400px] h-auto rounded-lg border-[2px] border-[#2C2C2C] object-cover"
          />
        </div>
      `;
    }
    // 이미지를 찾지 못했거나 키가 잘못된 경우, 빈 문자열로 대체 (제거)
    return '';
  });

  return text;
});


</script>

<style scoped>
.course-badge:hover {
  background-color: var(--hover-color);
}
</style>
