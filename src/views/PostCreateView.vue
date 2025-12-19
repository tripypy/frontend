<template>
  <div class="post-create-page">
    <h2>새 글 작성</h2>

    <input
      type="text"
      v-model="title"
      placeholder="제목을 입력하세요"
      class="title-input"
    />

    <ContentEditor v-model="postContent" />

    <button @click="submitPost" :disabled="!isFormValid">
      글 저장하기
    </button>

    <h3 style="margin-top: 20px;">현재 Post Content (HTML):</h3>
    <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border: 1px solid #ddd; max-height: 200px; overflow-y: auto;">{{ postContent }}</pre>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// @/components/post/ContentEditor.vue 경로는 프로젝트 구조에 따라 수정하세요.
import ContentEditor from '@/components/post/ContentEditor.vue';
// import axios from 'axios'; // 실제 서버 통신 시 주석 해제

// -------------------------------------------
// 1. 상태 (State) 정의
// -------------------------------------------
const title = ref('');
const postContent = ref(''); // ContentEditor로부터 받은 HTML 내용 저장

// -------------------------------------------
// 2. 유효성 검사 (Computed)
// -------------------------------------------
const isFormValid = computed<boolean>(() => {
    // 제목과 내용 모두 비어있지 않아야 유효
    return title.value.trim() !== '' && postContent.value.trim() !== '';
});

// -------------------------------------------
// 3. Mock API 함수 (백엔드 테스트 전)
// -------------------------------------------

/**
 * [TEST] 실제 서버 통신 대신 사용하는 Mock 함수
 */
const mockSubmitApi = (data: { title: string, content: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
        // 1초 딜레이를 주어 API 통신 중인 것처럼 시뮬레이션
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% 확률로 성공
                console.log('✅ Mock API Success:', data);
                resolve();
            } else { // 10% 확률로 실패 시뮬레이션
                console.error('❌ Mock API Failed');
                reject(new Error('Mock server internal error'));
            }
        }, 1000);
    });
};


// -------------------------------------------
// 4. 글 저장 로직 (Handler)
// -------------------------------------------
const submitPost = async () => {
    if (!isFormValid.value) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    const postData = {
        title: title.value,
        content: postContent.value, // Quill이 만든 HTML 내용
        // TODO: category, tags 등 추가 데이터 필드를 여기에 추가하세요.
    };

    try {
        // 💡 [TEST] 백엔드 준비 전: Mock 함수 사용
        await mockSubmitApi(postData);

        // ----------------------------------------------------
        // 🚀 백엔드 준비 완료 후: 실제 API 호출 사용
        // ----------------------------------------------------
        // const response = await axios.post('/api/posts', postData);
        // console.log('글 저장 성공:', response.data);

        alert('글이 성공적으로 저장되었습니다.');
        // router.push('/'); // 저장 후 페이지 이동

    } catch (error) {
        console.error('글 저장 실패:', error);
        alert(`글 저장 중 오류가 발생했습니다: ${error.message}`);
    }
};
</script>

<style scoped>
.post-create-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.title-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 1.5em;
  border: 1px solid #ddd;
  box-sizing: border-box;
}
/* ContentEditor 컴포넌트가 height를 가지고 있어야 에디터가 보입니다. */
/* ContentEditor.vue의 <style>에서 높이를 지정했는지 확인해 주세요. */
</style>
