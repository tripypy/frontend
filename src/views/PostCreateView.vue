<template>
  <div class="h-screen bg-[#F5F5F5] font-sans selection:bg-[#F9CA6B] selection:text-black flex flex-col overflow-hidden">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />

    <div class="flex-grow pt-24 max-w-[1700px] mx-auto w-full px-4 pb-0 flex flex-col box-border overflow-hidden">
      <section class="flex flex-col flex-grow bg-white rounded-t-2xl shadow-sm p-4 md:p-8 overflow-hidden h-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">여행 기록 작성</h2>
          <div class="flex items-center gap-4">
            <label class="flex items-center text-sm font-medium text-gray-600">
              공개 범위
              <select
                v-model="visibility"
                class="ml-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50
                      focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="PUBLIC">전체 공개</option>
                <option value="PRIVATE">비공개</option>
              </select>
            </label>
            <button
              class="px-8 py-2.5 rounded-full font-bold text-white
                    bg-black hover:bg-gray-800
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-all active:scale-95 shadow-md"
              :disabled="!isFormValid || isSubmitting"
              @click="submitPost"
            >
              {{ isSubmitting ? '저장 중...' : '기록 저장하기' }}
            </button>
          </div>
        </div>

        <input
          type="text"
          v-model="title"
          placeholder="여행 기록 제목을 입력하세요"
          class="w-full px-4 py-4 text-3xl font-bold border-b border-gray-50
                focus:outline-none focus:border-black transition-colors mb-4"
        />

        <div class="flex-grow flex flex-col min-h-0 relative h-full">
          <ContentEditor v-model="postContent" class="h-full" />
        </div>

        <!-- Debug HTML View (Real-time) -->
        <div class="mt-4 p-4 bg-gray-900 text-green-400 rounded-xl overflow-auto min-h-48 text-xs font-mono">
          <h3 class="text-white font-bold mb-2 uppercase tracking-wider">[실시간 HTML 데이터 확인]</h3>
          <pre>{{ postContent }}</pre>
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
