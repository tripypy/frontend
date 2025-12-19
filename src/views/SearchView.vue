<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar current-page="search" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1440px] mx-auto px-12 py-12">
      <!-- Search Section -->
      <div class="mb-12 mt-8 max-w-[900px] mx-auto">
        <div class="mb-6">
          <h2
            class="text-5xl font-black tracking-tighter uppercase"
            style="font-family: 'Outfit', sans-serif"
          >
            Discover <span class="text-[#9BCCC4]">Places</span>
          </h2>
        </div>

        <!-- Search Bar -->
        <div class="flex gap-3 mb-6">
          <div class="flex-1 relative">
            <div class="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search :size="20" :stroke-width="2" class="text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="인기 여행지와 추천 키워드로 새로운 여행을 시작해보세요"
              @keypress.enter="handleSearch"
              class="w-full pl-14 pr-6 py-5 bg-white border-[2px] border-[#2C2C2C] rounded-2xl text-base font-bold focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.2)] transition-all placeholder:font-medium placeholder:text-gray-400"
            />
          </div>
          <button
            @click="handleSearch"
            class="px-10 py-5 bg-[#2C2C2C] text-white border-[2px] border-[#2C2C2C] rounded-2xl font-black text-base hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-[1px_1px_0px_0px_rgba(44,44,44,1)] active:translate-x-[1px] active:translate-y-[1px] uppercase"
          >
            검색
          </button>
        </div>

        <!-- Popular Search Keywords (검색 전에만 표시) -->
        <div v-if="!hasSearched">
          <p class="text-sm font-bold text-gray-600 mb-3">인기 검색어</p>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="(keyword, index) in recommendedKeywords"
              :key="index"
              @click="searchByKeyword(keyword)"
              class="px-5 py-2.5 bg-[#FFF8ED] border-[2px] border-[#2C2C2C] rounded-full text-sm font-black hover:bg-[#F9CA6B] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              {{ keyword }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results Section -->
      <div v-if="hasSearched" class="max-w-[900px] mx-auto mb-12">
        <!-- Search Query Display -->
        <div class="mb-6">
          <h3 class="text-2xl font-black mb-2">
            '<span class="text-[#9BCCC4]">{{ currentSearchQuery }}</span
            >' 검색 결과
          </h3>
          <p class="text-sm font-bold text-gray-600">
            총 {{ totalResultsCount }}개의 결과를 찾았습니다
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-lg transition-all text-sm font-black whitespace-nowrap focus:outline-none border-[2px]',
              activeTab === tab.id
                ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#2C2C2C]',
            ]"
          >
            {{ tab.label }} ({{ getTabCount(tab.id) }})
          </button>
        </div>

        <!-- Results Content -->
        <div class="space-y-4">
          <!-- All Tab or Places Tab -->
          <template v-if="activeTab === 'all' || activeTab === 'places'">
            <div v-if="filteredPlaces.length > 0">
              <h4
                v-if="activeTab === 'all'"
                class="text-xl font-black mb-4 uppercase tracking-tight"
              >
                장소
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(place, index) in filteredPlaces"
                  :key="place.id"
                  @click="handlePlaceClick(place, index)"
                  class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-4 hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] transition-all cursor-pointer group"
                >
                  <div class="flex items-center gap-4">
                    <!-- Image -->
                    <div
                      class="w-24 h-24 border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        :src="place.imageUrl"
                        :alt="place.name"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        @error="handleImageError"
                      />
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between mb-1">
                        <h5 class="text-xl font-black group-hover:text-[#9BCCC4] transition-colors">
                          {{ place.name }}
                        </h5>
                        <div
                          class="flex items-center gap-1 px-2.5 py-1 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-full flex-shrink-0 ml-2"
                        >
                          <Star :size="14" :stroke-width="2" class="fill-current text-[#2C2C2C]" />
                          <span class="text-xs font-black">{{ place.rating }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 text-xs font-bold mb-2 text-gray-600">
                        <MapPin :size="14" :stroke-width="2" />
                        <span>{{ place.location }}</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700 mb-2 line-clamp-2">
                        {{ place.description }}
                      </p>
                      <div class="flex items-center justify-between">
                        <div class="flex gap-1.5 flex-wrap">
                          <span
                            v-for="(tag, idx) in place.tags"
                            :key="idx"
                            class="px-2.5 py-0.5 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-full text-xs font-black"
                          >
                            #{{ tag }}
                          </span>
                        </div>
                        <div class="text-xs font-bold text-gray-500">
                          {{ place.views.toLocaleString() }} 조회
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- All Tab or Courses Tab -->
          <template v-if="activeTab === 'all' || activeTab === 'courses'">
            <div v-if="filteredCourses.length > 0" :class="{ 'mt-8': activeTab === 'all' }">
              <h4
                v-if="activeTab === 'all'"
                class="text-xl font-black mb-4 uppercase tracking-tight"
              >
                코스
              </h4>
              <div class="space-y-3">
                <div
                  v-for="course in filteredCourses"
                  :key="course.id"
                  @click="handleCourseClick(course)"
                  class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-4 hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] transition-all cursor-pointer group"
                >
                  <div class="flex items-center gap-4">
                    <!-- Image -->
                    <div
                      class="w-24 h-24 border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        :src="course.imageUrl"
                        :alt="course.title"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        @error="handleImageError"
                      />
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <h5
                        class="text-xl font-black mb-1 group-hover:text-[#E88555] transition-colors"
                      >
                        {{ course.title }}
                      </h5>
                      <div class="flex items-center gap-2 text-xs font-bold mb-2 text-gray-600">
                        <MapPin :size="14" :stroke-width="2" />
                        <span>{{ course.spots }}개 장소</span>
                        <span class="text-gray-400">•</span>
                        <span>{{ course.duration }}</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700 mb-2 line-clamp-2">
                        {{ course.description }}
                      </p>
                      <div class="flex items-center justify-between">
                        <div class="flex gap-1.5 flex-wrap">
                          <span
                            v-for="(tag, idx) in course.tags"
                            :key="idx"
                            class="px-2.5 py-0.5 bg-[#FFF8ED] border-[2px] border-[#2C2C2C] rounded-full text-xs font-black"
                          >
                            #{{ tag }}
                          </span>
                        </div>
                        <div class="text-xs font-bold text-gray-500">
                          {{ course.views.toLocaleString() }} 조회
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- All Tab or Diaries Tab -->
          <template v-if="activeTab === 'all' || activeTab === 'diaries'">
            <div v-if="filteredDiaries.length > 0" :class="{ 'mt-8': activeTab === 'all' }">
              <h4
                v-if="activeTab === 'all'"
                class="text-xl font-black mb-4 uppercase tracking-tight"
              >
                다이어리
              </h4>
              <div class="space-y-3">
                <div
                  v-for="diary in filteredDiaries"
                  :key="diary.id"
                  @click="handleDiaryClick(diary)"
                  class="bg-white border-[2px] border-[#2C2C2C] rounded-xl p-4 hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] transition-all cursor-pointer group"
                >
                  <div class="flex gap-4">
                    <!-- Images Grid -->
                    <div class="w-32 h-32 flex-shrink-0">
                      <div
                        v-if="diary.images && diary.images.length === 1"
                        class="w-full h-full border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden"
                      >
                        <img
                          :src="diary.images[0]"
                          :alt="diary.title"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          @error="handleImageError"
                        />
                      </div>
                      <div
                        v-else-if="diary.images && diary.images.length > 1"
                        class="grid grid-cols-2 gap-1 w-full h-full"
                      >
                        <div
                          v-for="(img, idx) in diary.images.slice(0, 4)"
                          :key="idx"
                          class="border-[2px] border-[#2C2C2C] rounded-lg overflow-hidden"
                        >
                          <img
                            :src="img"
                            :alt="`${diary.title} ${idx + 1}`"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            @error="handleImageError"
                          />
                        </div>
                      </div>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <div
                          class="w-6 h-6 rounded-full bg-[#9BCCC4] border-[2px] border-[#2C2C2C]"
                        ></div>
                        <span class="text-sm font-black">{{ diary.author }}</span>
                        <span class="text-xs font-bold text-gray-500">{{ diary.date }}</span>
                      </div>
                      <h5
                        class="text-lg font-black mb-1 group-hover:text-[#9BCCC4] transition-colors"
                      >
                        {{ diary.title }}
                      </h5>
                      <div class="flex items-center gap-2 text-xs font-bold mb-2 text-gray-600">
                        <MapPin :size="14" :stroke-width="2" />
                        <span>{{ diary.location }}</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700 mb-3 line-clamp-2">
                        {{ diary.content }}
                      </p>
                      <div class="flex items-center gap-4 text-xs font-bold text-gray-600">
                        <div class="flex items-center gap-1">
                          <Heart :size="14" :stroke-width="2" />
                          <span>{{ diary.likes }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <MessageCircle :size="14" :stroke-width="2" />
                          <span>{{ diary.comments }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- No Results -->
          <div
            v-if="
              (activeTab === 'all' && totalResultsCount === 0) ||
              (activeTab === 'places' && filteredPlaces.length === 0) ||
              (activeTab === 'courses' && filteredCourses.length === 0) ||
              (activeTab === 'diaries' && filteredDiaries.length === 0)
            "
            class="text-center py-12"
          >
            <div
              class="w-16 h-16 bg-gray-100 border-[2px] border-gray-300 rounded-xl mx-auto mb-4 flex items-center justify-center"
            >
              <Search :size="32" :stroke-width="2" class="text-gray-400" />
            </div>
            <p class="text-lg font-black text-gray-600 mb-1">검색 결과가 없습니다</p>
            <p class="text-sm font-bold text-gray-500">다른 키워드로 검색해보세요</p>
          </div>
        </div>
      </div>

      <!-- Hot Places TOP 10 (검색 전에만 표시) -->
      <div v-if="!hasSearched" class="max-w-[900px] mx-auto">
        <h2
          class="text-5xl mb-6 font-black tracking-tighter uppercase"
          style="font-family: 'Outfit', sans-serif"
        >
          Hot Place <span class="text-[#E88555]">Top 10</span>
        </h2>

        <div class="space-y-4">
          <div
            v-for="(place, index) in hotPlaces"
            :key="place.id"
            @click="handlePlaceClick(place, index)"
            class="bg-white border-[2px] border-[#2C2C2C] rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(44,44,44,0.15)] group cursor-pointer"
          >
            <div class="flex items-center gap-5">
              <!-- Rank Number -->
              <div
                :class="[
                  'w-16 h-16 border-[2px] border-[#2C2C2C] rounded-xl flex items-center justify-center flex-shrink-0',
                  index < 3 ? 'bg-[#F9CA6B]' : 'bg-[#FFF8ED]',
                ]"
              >
                <span class="text-3xl font-black" style="font-family: 'Bebas Neue', sans-serif">
                  {{ index + 1 }}
                </span>
              </div>

              <!-- Thumbnail Image -->
              <div
                class="w-36 h-28 border-[2px] border-[#2C2C2C] rounded-xl overflow-hidden flex-shrink-0"
              >
                <img
                  :src="place.imageUrl"
                  :alt="place.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  @error="handleImageError"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <h3
                    class="text-2xl font-black tracking-tight group-hover:text-[#E88555] transition-colors"
                    style="font-family: 'Poppins', sans-serif"
                  >
                    {{ place.name }}
                  </h3>
                  <div
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9CA6B] border-[2px] border-[#2C2C2C] rounded-full flex-shrink-0 ml-3"
                  >
                    <Star :size="16" :stroke-width="2" class="fill-current text-[#2C2C2C]" />
                    <span class="text-sm font-black">{{ place.rating }}</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 text-sm font-bold mb-4 text-gray-700">
                  <MapPin :size="16" :stroke-width="2" />
                  <span>{{ place.location }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <!-- Tags -->
                  <div class="flex gap-2 flex-wrap">
                    <span
                      v-for="(tag, idx) in place.tags"
                      :key="idx"
                      class="px-3 py-1 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-full text-xs font-black"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                  
                  <!-- Views -->
                  <div class="text-xs font-bold text-gray-500">
                    {{ place.views.toLocaleString() }} 조회
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ScrollToTop />

    <!-- Diary Modal -->
    <DiaryCommentModal
      v-if="selectedDiary"
      :log-id="selectedDiary.id"
      :author="selectedDiary.author"
      :author-avatar="selectedDiary.authorAvatar"
      :location="selectedDiary.location"
      :date="selectedDiary.date"
      :title="selectedDiary.title"
      :content="selectedDiary.content"
      :images="selectedDiary.images"
      :likes="selectedDiary.likes"
      :comments="selectedDiary.comments"
      :course="selectedDiary.course"
      @close="selectedDiary = null"
    />

    <!-- Course/Trip Modal -->
    <TripDetailModal
      v-if="selectedCourse"
      :trip="selectedCourse"
      @close="selectedCourse = null"
      @edit="handleCourseEdit"
    />

    <!-- Place Detail Modal -->
    <PlaceDetailModal v-if="selectedPlace" :place="selectedPlace" @close="selectedPlace = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigate } from '@/composables/common/useNavagation'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import { Search, MapPin, Star, Heart, MessageCircle, Map, BookOpen } from 'lucide-vue-next'
import DiaryCommentModal from '@/components/modal/DiaryCommentModal.vue'
import TripDetailModal from '@/components/modal/TripDetailModal.vue'
import PlaceDetailModal from '@/components/modal/PlaceDetailModal.vue'

const router = useRouter()
const { handleNavigate } = useNavigate()
const searchQuery = ref('')
const currentSearchQuery = ref('')
const hasSearched = ref(false)
const activeTab = ref<'all' | 'places' | 'courses' | 'diaries'>('all')
const selectedDiary = ref<any>(null)
const selectedCourse = ref<any>(null)
const selectedPlace = ref<any>(null)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    currentSearchQuery.value = searchQuery.value
    hasSearched.value = true
    activeTab.value = 'all'
  }
}

const searchByKeyword = (keyword: string) => {
  searchQuery.value = keyword
  handleSearch()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/no-image.jpg'
}

const handleDiaryClick = (diary: any) => {
  selectedDiary.value = diary
}

const handleCourseClick = (course: any) => {
  selectedCourse.value = course
}

const handleCourseEdit = (course: any) => {
  // 편집 모드로 이동
  router.push(`/create-trip?id=${course.id}`)
  selectedCourse.value = null
}

const handlePlaceClick = (place: any, index?: number) => {
  selectedPlace.value = {
    number: index !== undefined ? index + 1 : 1,
    name: place.name,
  }
}

// Mock Data
const recommendedKeywords = [
  '성수동',
  '카페',
  '한강',
  '맛집',
  '북촌',
  '을지로',
  '연남동',
  '망원동',
  '익선동',
  '강남',
]

import { allPlaces } from '@/data/mockData'

// Mock Courses Data
const allCourses = [
  {
    id: 1,
    title: '성수동 힙스터 코스',
    spots: 5,
    duration: '반나절',
    description: '대림창고 - 어반비즈 - 그리노성수 - 성수연방 - 테라로사 성수점',
    tags: ['카페', '성수동', '사진'],
    views: 15230,
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: 2,
    title: '한강 자전거 라이딩',
    spots: 8,
    duration: '하루',
    description: '망원한강공원 → 양화대교 → 반포한강공원 → 뚝섬한강공원 순환 코스',
    tags: ['한강', '자전거', '운동'],
    views: 23450,
    imageUrl:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: 3,
    title: '북촌 한옥마을 & 익선동 투어',
    spots: 6,
    duration: '반나절',
    description: '전통과 현대가 공존하는 서울의 매력을 느낄 수 있는 문화 코스',
    tags: ['전통', '카페', '북촌'],
    views: 18920,
    imageUrl:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: 4,
    title: '을지로 레트로 맛집 투어',
    spots: 7,
    duration: '하루',
    description: '을지로 인쇄골목과 숨은 맛집들을 돌아보는 미식 여행',
    tags: ['맛집', '레트로', '을지로'],
    views: 21340,
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: 5,
    title: '연남동 감성 카페 투어',
    spots: 4,
    duration: '반나절',
    description: '연남동의 숨은 보석 같은 카페들을 찾아가는 여유로운 오후',
    tags: ['카페', '연남동', '힐링'],
    views: 16780,
    imageUrl:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
]

// Mock Diaries Data
const allDiaries = [
  {
    id: 1,
    author: '여행러버',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: '2024.11.28',
    title: '성수동 카페 투어 다녀왔어요!',
    location: '서울 성동구',
    content:
      '대림창고부터 시작해서 성수동 일대 핫한 카페들을 다 돌아봤어요. 사진 찍기도 너무 좋고 커피도 맛있었어요. 특히 그리노 성수의 플랫화이트 추천!',
    likes: 234,
    comments: 18,
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      'https://images.unsplash.com/photo-1501492693223-0b319f96b8e1?w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    ],
    course: [
      { number: 1, name: '대림창고' },
      { number: 2, name: '그리노 성수' },
      { number: 3, name: '어반비즈' },
      { number: 4, name: '테라로사 성수' },
    ],
  },
  {
    id: 2,
    author: '서울탐방',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    date: '2024.11.25',
    title: '북촌한옥마을 야경이 정말 예뻐요',
    location: '서울 종로구',
    content:
      '낮에도 이쁘지만 밤에 가면 한옥의 조명이 정말 아름다워요. 사람도 적고 사진 찍기 딱 좋았습니다. 데이트 코스로 강력 추천!',
    likes: 189,
    comments: 12,
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
    ],
    course: [
      { number: 1, name: '북촌한옥마을' },
      { number: 2, name: '삼청동' },
      { number: 3, name: '인사동' },
    ],
  },
  {
    id: 3,
    author: '맛집헌터',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    date: '2024.11.22',
    title: '을지로 숨은 맛집 대공개',
    location: '서울 중구',
    content:
      '을지로에는 정말 숨은 맛집들이 많아요. 레스토랑 소공, 인쇄골목 근처 분식집 등 현지인만 아는 곳들을 다녀왔습니다!',
    likes: 312,
    comments: 24,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    course: [
      { number: 1, name: '인쇄골목' },
      { number: 2, name: '레스토랑 소공' },
      { number: 3, name: '을지면옥' },
    ],
  },
  {
    id: 4,
    author: '자전거매니아',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    date: '2024.11.20',
    title: '한강 자전거 라이딩 완주!',
    location: '서울 한강',
    content:
      '망원에서 출발해서 뚝섬까지 왕복했어요. 날씨 좋은 날 한강 라이딩 정말 최고입니다. 중간중간 편의점도 많고 쉬어갈 곳도 많아요.',
    likes: 145,
    comments: 8,
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
      'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800',
    ],
    course: [
      { number: 1, name: '망원한강공원' },
      { number: 2, name: '양화대교' },
      { number: 3, name: '반포한강공원' },
      { number: 4, name: '뚝섬한강공원' },
    ],
  },
  {
    id: 5,
    author: '카페투어',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    date: '2024.11.18',
    title: '연남동 숨은 카페 추천',
    location: '서울 마포구 연남동',
    content:
      '연남동에는 정말 예쁜 카페들이 많아요. 히든트랙, 연남방앗간 등 인스타감성 카페부터 조용한 북카페까지 다양합니다.',
    likes: 267,
    comments: 15,
    images: [
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    ],
    course: [
      { number: 1, name: '히든트랙' },
      { number: 2, name: '연남방앗간' },
      { number: 3, name: '연남서식' },
    ],
  },
  {
    id: 6,
    author: '강남러버',
    authorAvatar:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
    date: '2024.11.15',
    title: '청담동 럭셔리 거리 산책',
    location: '서울 강남구 청담동',
    content: '청담동 명품 거리와 감성 카페들을 둘러봤어요. 비싸지만 분위기 하나는 끝내줍니다!',
    likes: 198,
    comments: 11,
    images: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800'],
    course: [
      { number: 1, name: '에르메스 청담' },
      { number: 2, name: '압구정 카페' },
    ],
  },
]

const hotPlaces = allPlaces.slice(0, 10)

// Computed - Filtered Results
const filteredPlaces = computed(() => {
  if (!currentSearchQuery.value) return []
  const query = currentSearchQuery.value.toLowerCase()
  return allPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(query) ||
      place.location.toLowerCase().includes(query) ||
      place.description.toLowerCase().includes(query) ||
      place.tags.some((tag) => tag.toLowerCase().includes(query)),
  )
})

const filteredCourses = computed(() => {
  if (!currentSearchQuery.value) return []
  const query = currentSearchQuery.value.toLowerCase()
  return allCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.tags.some((tag) => tag.toLowerCase().includes(query)),
  )
})

const filteredDiaries = computed(() => {
  if (!currentSearchQuery.value) return []
  const query = currentSearchQuery.value.toLowerCase()
  return allDiaries.filter(
    (diary) =>
      diary.title.toLowerCase().includes(query) ||
      diary.content.toLowerCase().includes(query) ||
      diary.location.toLowerCase().includes(query) ||
      diary.author.toLowerCase().includes(query),
  )
})

const totalResultsCount = computed(() => {
  return filteredPlaces.value.length + filteredCourses.value.length + filteredDiaries.value.length
})

const tabs = [
  { id: 'all' as const, label: '전체' },
  { id: 'places' as const, label: '장소' },
  { id: 'courses' as const, label: '코스' },
  { id: 'diaries' as const, label: '다이어리' },
]

const getTabCount = (tabId: string) => {
  if (tabId === 'all') return totalResultsCount.value
  if (tabId === 'places') return filteredPlaces.value.length
  if (tabId === 'courses') return filteredCourses.value.length
  if (tabId === 'diaries') return filteredDiaries.value.length
  return 0
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
