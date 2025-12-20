<template>
  <div class="post-create-page">
    <TravelNavbar current-page="main" @navigate="handleNavigate" />

    <section class="editor-card">
      <h2 class="page-title">여행 기록 작성</h2>

      <!-- 제목 -->
      <input
        type="text"
        v-model="title"
        placeholder="여행 기록 제목을 입력하세요"
        class="title-input"
      />

      <!-- 에디터 -->
      <ContentEditor v-model="postContent" />

      <!-- 옵션 영역 -->
      <div class="options">
        <label>
          공개 범위
          <select v-model="visibility">
            <option value="PUBLIC">전체 공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </label>
      </div>

      <!-- 저장 버튼 -->
      <div class="actions">
        <button
          class="submit-btn"
          :disabled="!isFormValid || isSubmitting"
          @click="submitPost"
        >
          {{ isSubmitting ? '저장 중...' : '기록 저장하기' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentEditor from '@/components/post-write/ContentEditor.vue'
import { useNavigate } from '@/composables/common/useNavagation'
import { postTripLogCreate } from '@/apis/trip-log/index'

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

<style scoped>
.post-create-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.editor-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.title-input {
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 20px;
}

.options {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.options select {
  margin-left: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.submit-btn {
  padding: 12px 20px;
  font-weight: 700;
  border-radius: 999px;
  background: #2c2c2c;
  color: #fff;
  border: none;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
