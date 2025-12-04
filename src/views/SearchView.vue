<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <TravelNavbar current-page="search" @navigate="handleNavigate" />

    <div class="pt-28 max-w-[1440px] mx-auto px-12 py-12">
      <!-- Search Section -->
      <div class="mb-16 mt-8 max-w-[900px] mx-auto">
        <div class="mb-6">
          <h2
            class="text-5xl font-black tracking-tighter uppercase"
            style="font-family: 'Outfit', sans-serif"
          >
            Discover <span class="italic text-[#9BCCC4]">Places</span>
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

        <!-- Popular Search Keywords -->
        <div>
          <p class="text-sm font-bold text-gray-600 mb-3">인기 검색어</p>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="(keyword, index) in recommendedKeywords"
              :key="index"
              class="px-5 py-2.5 bg-[#FFF8ED] border-[2px] border-[#2C2C2C] rounded-full text-sm font-black hover:bg-[#F9CA6B] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              {{ keyword }}
            </button>
          </div>
        </div>
      </div>

      <!-- Hot Places TOP 10 -->
      <div class="max-w-[900px] mx-auto">
        <h2
          class="text-5xl mb-6 font-black tracking-tighter uppercase"
          style="font-family: 'Outfit', sans-serif"
        >
          Hot Place <span class="italic text-[#E88555]">Top 10</span>
        </h2>

        <div class="space-y-4">
          <div
            v-for="(place, index) in hotPlaces"
            :key="place.id"
            class="bg-white border-[2px] border-[#2C2C2C] rounded-2xl p-5 clickable-card shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(44,44,44,0.15)] group cursor-pointer"
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
              <div class="w-36 h-28 border-[2px] border-[#2C2C2C] rounded-xl overflow-hidden flex-shrink-0">
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
                <div class="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700">
                  <MapPin :size="16" :stroke-width="2" />
                  <span>{{ place.location }}</span>
                </div>
                <p class="text-sm mb-3 font-medium text-gray-700 leading-relaxed">
                  {{ place.description }}
                </p>
                <div class="flex items-center justify-between">
                  <div class="flex gap-2 flex-wrap">
                    <span
                      v-for="(tag, idx) in place.tags"
                      :key="idx"
                      class="px-3 py-1 bg-[#9BCCC4] border-[2px] border-[#2C2C2C] rounded-full text-xs font-black"
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
    </div>

    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TravelNavbar from '@/components/common/TravelNavbar.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import { Search, MapPin, Star } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')

const handleNavigate = (page: string) => {
  if (page === 'main') {
    router.push('/')
  } else if (page === 'trips') {
    router.push('/trips')
  } else if (page === 'search') {
    router.push('/search')
  } else if (page === 'create-trip') {
    router.push('/create-trip')
  }
}

const handleSearch = () => {
  console.log('Search query:', searchQuery.value)
  // TODO: Implement search logic here
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/400x300?text=No+Image'
}

const recommendedKeywords = [
  '성수동 그리노 성수',
  '돈그리아 선릉점',
  '홍대 젠틀몬스터 팝업스토어',
  '성수 어반비즈서울',
  '압구정 청담동 에르메스',
  '한남동 무신사 테라스',
  '이태원 파파이스',
  '망원동 앤트러사이트',
  '연남동 히든트랙',
  '을지로 레스토랑 소공',
  '성수동 대림창고',
  '강남 스타필드 코엑스몰',
  '홍대 무브홀',
  '가로수길 롤리폴리',
  '북촌 한옥마을 카페',
]

const hotPlaces = [
  {
    id: 1,
    name: '성수동 카페 투어',
    location: '서울 성동구',
    description: '대림창고부터 그리노 성수까지, 트렌디한 카페를 돌아보는 오후 산책',
    rating: 4.8,
    tags: ['카페', '사진'],
    views: 45320,
    color: '#F4B4D0',
    imageUrl:
      'https://images.unsplash.com/photo-1735491428084-853fb91c09e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbmR1c3RyaWFsJTIwd2FyZWhvdXNlJTIwY2FmZSUyMHNlb3VsfGVufDF8fHx8MTc2NDQwMzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: '연남동 골목길 산책',
    location: '서울 마포구',
    description: '히든트랙과 작은 갤러리를 구경하며 여유롭게 걷는 코스',
    rating: 4.9,
    tags: ['산책', '힐링'],
    views: 38750,
    color: '#B4D4F4',
    imageUrl:
      'https://images.unsplash.com/photo-1594020183965-09716116c5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMHN0cmVldCUyMGFsbGV5JTIwY29sb3JmdWx8ZW58MXx8fHwxNzY0NDAzMzg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: '망원 한강 자전거 라이딩',
    location: '서울 마포구',
    description: '망원한강공원에서 여의도까지 시원하게 달리는 주말 라이딩',
    rating: 4.7,
    tags: ['자전거', '운동'],
    views: 52180,
    color: '#F4D58D',
    imageUrl:
      'https://images.unsplash.com/photo-1710634320271-69ca1beddd2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXZlcnNpZGUlMjBwYXJrJTIwYmljeWNsZSUyMHBhdGh8ZW58MXx8fHwxNzY0NDAzMzk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    name: '익선동 한옥 카페 탐방',
    location: '서울 종로구',
    description: '좁은 골목 사이 숨은 한옥 카페에서 여유를 즐기는 시간',
    rating: 4.6,
    tags: ['카페', '전통'],
    views: 29430,
    color: '#B4D4A5',
    imageUrl:
      'https://images.unsplash.com/photo-1714947294881-0258899c5158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBkZXNzZXJ0JTIwY2FmZXxlbnwxfHx8fDE3NjQ0MDM0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    name: '을지로 레트로 투어',
    location: '서울 중구',
    description: '인쇄골목과 레스토랑 소공을 거쳐 옛 서울의 정취를 느끼는 코스',
    rating: 4.5,
    tags: ['레트로', '맛집'],
    views: 41200,
    color: '#F4B4D0',
    imageUrl:
      'https://images.unsplash.com/photo-1691071097372-133c238ac6aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcmV0cm8lMjBzaWduYWdlJTIwa29yZWF8ZW58MXx8fHwxNzY0NDAzMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    name: '송리단길 맛집 탐방',
    location: '서울 송파구',
    description: '송파 이면도로 숨은 맛집들을 돌아보는 미식 산책',
    rating: 4.7,
    tags: ['맛집', '산책'],
    views: 36890,
    color: '#B4D4F4',
    imageUrl:
      'https://images.unsplash.com/photo-1639923536870-a7de9633f23e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwcmVzdGF1cmFudCUyMGludGVyaW9yfGVufDF8fHx8MTc2NDQwMzM5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 7,
    name: '강남 카페 호핑',
    location: '서울 강남구',
    description: '청담동 에르메스부터 압구정 감성 카페까지 럭셔리 카페 투어',
    rating: 4.8,
    tags: ['카페', '사진'],
    views: 48670,
    color: '#F4D58D',
    imageUrl:
      'https://images.unsplash.com/photo-1726649819338-a3258bf46fe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwY2FmZSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDQwMzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 8,
    name: '북촌 한옥마을 산책',
    location: '서울 종로구',
    description: '한옥 골목길과 뷰 포인트를 천천히 걸으며 사진 찍기 좋은 코스',
    rating: 4.9,
    tags: ['산책', '사진'],
    views: 33210,
    color: '#B4D4A5',
    imageUrl:
      'https://images.unsplash.com/photo-1650476524542-c5cc53306700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5vayUyMGtvcmVhbiUyMHRyYWRpdGlvbmFsJTIwaG91c2V8ZW58MXx8fHwxNzY0NDAzMzkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 9,
    name: '부산 국밥 투어',
    location: '부산 동구',
    description: '새벽 밀양돼지국밥부터 점심 할매국밥까지 부산 국밥 맛집 순례',
    rating: 4.8,
    tags: ['맛집', '부산'],
    views: 27580,
    color: '#F4B4D0',
    imageUrl:
      'https://images.unsplash.com/photo-1761824197809-9f1a3b33266c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzY0NDAzMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 10,
    name: '분당 카페거리 투어',
    location: '경기 성남시',
    description: '정자동 카페거리에서 브런치와 디저트를 즐기는 주말 나들이',
    rating: 4.6,
    tags: ['카페', '경기'],
    views: 39420,
    color: '#B4D4F4',
    imageUrl:
      'https://images.unsplash.com/photo-1630840274967-ece6eaa61dfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mdG9wJTIwY2FmZSUyMGNpdHklMjB2aWV3fGVufDF8fHx8MTc2NDQwMzM4OHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
]
</script>
