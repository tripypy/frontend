<template>
  <div class="editor-container">
    <QuillEditor
      theme="snow"
      :options="editorOptions"
      :content="content"
      contentType="html"
      @update:content="updateContent"
      @ready="onReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
// 💡 Mock 테스트를 위해 axios import는 제거합니다. (나중에 백엔드 연동 시 주석 해제)
// import axios from 'axios';

// -----------------------------------------------------------
// 1. Props 및 Emits 정의
// -----------------------------------------------------------

interface Props {
  modelValue: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
});

// emit 타입 정의
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'image-uploaded', url: string): void;
}>();

// -----------------------------------------------------------
// 2. 상태 및 옵션 정의
// -----------------------------------------------------------

const quillInstance: Ref<any> = ref(null);
const content = ref(props.modelValue);

// Quill Editor 옵션 정의
const editorOptions = {
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                ['image'], // 'image' 버튼
                ['clean']
            ],
        }
    }
};

// -----------------------------------------------------------
// 3. 로직 함수
// -----------------------------------------------------------

// 내용 변경 감지 및 부모에게 전달
const updateContent = (newContent: string) => {
  content.value = newContent;
  emit('update:modelValue', newContent);
};

// 부모의 modelValue 변경 시 자식의 content 업데이트
watch(() => props.modelValue, (newValue) => {
    if (newValue !== content.value) {
        content.value = newValue;
    }
});

// 에디터 준비 완료 시: 커스텀 핸들러 연결
const onReady = (quill: any) => {
  quillInstance.value = quill;
  quill.getModule('toolbar').addHandler('image', handleImageUpload);
};

/**
 * 4. 커스텀 이미지 업로드 및 에디터 삽입 로직 (Mocking)
 */
const handleImageUpload = () => {
  if (!quillInstance.value) return;

  // 1. 파일 선택용 input 생성 및 클릭
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    // 💡 [Mocking 시작] 실제 서버 통신 대신 임시 로직을 실행합니다.
    try {
      console.log(`선택된 파일: ${file.name}. Mock 업로드 시작...`);

      // 서버 통신 시간처럼 1초 딜레이를 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 서버에서 받은 이미지 URL을 가정합니다. (실제 사용 가능한 이미지 URL)
      const mockImageUrl = 'https://picsum.photos/600/400';

      const imageUrl = mockImageUrl;

      // 2. 에디터에 이미지 삽입
      const range = quillInstance.value.getSelection(true);
      const index = range ? range.index : 0;

      quillInstance.value.insertEmbed(index, 'image', imageUrl, 'user');

      // 3. 삽입 후 커서 위치를 이미지 다음으로 이동
      quillInstance.value.setSelection(index + 1, 0);

      console.log(`✅ Mock 업로드 및 삽입 완료: ${imageUrl}`);
      emit('image-uploaded', imageUrl);

    } catch (error) {
      // Mock 로직에서는 거의 발생하지 않지만, try-catch 구조는 유지합니다.
      console.error('Mock Image process failed:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
    // 💡 [Mocking 끝] 백엔드 준비 후 이 블록의 코드를 실제 axios 코드로 대체하면 됩니다.
  };
};
</script>

<style scoped>
/* 에디터 컨테이너 스타일 */
.editor-container {
  height: 500px; /* 에디터 높이 지정 */
}
</style>
