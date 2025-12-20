<template>
  <div class="min-h-screen bg-[#F5F5F5] font-sans selection:bg-[#F9CA6B] selection:text-black">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />
    <div class="pt-28 max-w-[1440px] mx-auto px-6 pb-12">
    <section class="mt-20 flex flex-col gap-6 bg-white rounded-2xl shadow-lg p-8">
      <h2 class="text-2xl font-bold mb-6">여행 기록 작성</h2>

      <!-- 제목 -->
      <input
        type="text"
        v-model="title"
        placeholder="여행 기록 제목을 입력하세요"
        class="w-full mb-6 px-4 py-3 text-lg border border-gray-300 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-gray-400"
      />

      <!-- 에디터 -->
      <div class="min-h-[360px] mb-6">
        <ContentEditor v-model="postContent" />
      </div>

      <!-- 옵션 -->
      <div class="flex justify-end mb-6">
        <label class="flex items-center text-sm font-medium text-gray-700">
          공개 범위
          <select
            v-model="visibility"
            class="ml-2 px-3 py-1 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="PUBLIC">전체 공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </label>
      </div>

      <!-- 저장 버튼 -->
      <div class="flex justify-end">
        <button
          class="px-6 py-3 rounded-full font-bold text-white
                 bg-gray-900 hover:bg-gray-800
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 transition"
          :disabled="!isFormValid || isSubmitting"
          @click="submitPost"
        >
          {{ isSubmitting ? '저장 중...' : '기록 저장하기' }}
        </button>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentEditor from '@/components/log-write/ContentEditor.vue'
import { useNavigate } from '@/composables/common/useNavagation'
import { postTripLogCreate } from '@/apis/trip-log/index'
import TravelNavbar from '@/components/common/TravelNavbar.vue'

const { handleNavigate } = useNavigate()
const route = useRoute()
const router = useRouter()

// ----------------------------
// 상태
// ----------------------------
const title = ref('')
const postContent = ref('')
const visibility = ref<'PUBLIC' | 'PRIVATE'>('PUBLIC')
const isSubmitting = ref(false)

// tripId는 route param 기준
const tripId = Number(route.params.tripId)

// ----------------------------
// 유효성
// ----------------------------
const isFormValid = computed(() => {
  return title.value.trim() !== '' && postContent.value.trim() !== ''
})


// ----------------------------
// 제출 로직
// ----------------------------
const submitPost = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const payload = {
      tripId,
      title: title.value,
      content: postContent.value,
      visibility: visibility.value,
    }

    const { logId } = await postTripLogCreate(payload)

    // 성공 시 해당 로그 페이지로 이동
    router.push(`/trip-logs/${logId}`)
  } catch (err) {
    console.error('글 작성 실패', err)
    alert('글 저장 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
