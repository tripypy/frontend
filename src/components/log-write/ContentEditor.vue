<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden
}

:deep(.ql-container) {
  border: none !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.ql-editor) {
  flex-grow: 1;
  padding: 32px;
  font-size: 18px;
  line-height: 1.8;
  color: #2d3748;

  overflow-y: auto;
  min-height: 0;
  padding-bottom: 1000px;
}

:deep(.ql-editor img) {
    max-width: 33.333%;
    width: auto;
    height: auto;

    border-radius: 8px;
    display: block;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: all 0.2s ease;
}

:deep(.ql-editor img.uploading) {
  opacity: 0.4;
  filter: blur(2px);
  cursor: wait;
  outline: 2px dashed #ccc;
}

:deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid #f7f7f7 !important;
  padding: 12px 24px !important;
  background: white;
}
</style>

<template>
  <div class="editor-wrapper border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm h-full relative">
    <!-- Mini Progress Indicator -->
    <div
      v-if="isUploading"
      class="absolute top-16 right-4 z-20
            bg-white/90 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg
            p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div class="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      <div class="flex flex-col">
        <span class="text-xs font-bold text-gray-800">이미지 업로드 중 ({{ uploadingImages.length }}개)</span>
        <div class="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div
            class="h-full bg-black transition-all duration-500"
            :style="{ width: avgProgress + '%' }"
          />
        </div>
      </div>
    </div>

    <div class="relative flex-grow flex flex-col h-full">
      <QuillEditor
        class="flex-grow h-full"
        theme="snow"
        contentType="html"
        :content="content"
        @update:content="updateContent"
        @ready="onReady"
      />
    </div>
  </div>
</template>


<script setup lang="ts">
import Quill from 'quill'
import { ref, watch, computed, type Ref } from 'vue'
import { getPresignedUrl} from '@/apis/trip-log/index'
import { uploadToS3, getPublicImageUrl } from '@/composables/trip-log/useImageUpload'
import type { UploadingImage } from '@/types/image/image.model'
import { resizeImage } from '@/utils/imageResize'

/* -------------------------------------------------------------------------- */
/* Quill 초기화 패치 (가장 중요)                 */
/* -------------------------------------------------------------------------- */
// Quill이 로드되자마자 실행되어야 합니다.
const Image = Quill.import('formats/image');

// 기존 방식(상속)이 안 먹힐 때 사용하는 "직접 패치" 방식입니다.
// 원본 sanitize 함수를 백업합니다.
const originalSanitize = Image.sanitize;

// Image 포맷의 sanitize 함수를 덮어씁니다.
Image.sanitize = function(url: string) {
  // 1. blob이나 data URL이면 무조건 통과 (보안 검사 건너뛰기)
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // 2. 그 외(http 등)는 기존 로직을 태움
  return originalSanitize(url);
};

// data-upload-id 속성을 유지하기 위한 포맷 설정도 직접 패치합니다.
const originalFormats = Image.formats;
Image.formats = function(domNode: HTMLElement) {
  const formats = originalFormats.call(this, domNode) || {}; // 기존 포맷 가져오기
  if (domNode.hasAttribute('data-upload-id')) {
    formats['upload-id'] = domNode.getAttribute('data-upload-id');
  }
  return formats;
};

// 프로토타입의 format 메서드도 확장합니다 (속성 쓰기용).
const originalFormat = Image.prototype.format;
Image.prototype.format = function(name: string, value: any) {
  if (name === 'upload-id') {
    if (value) {
      this.domNode.setAttribute('data-upload-id', value);
    } else {
      this.domNode.removeAttribute('data-upload-id');
    }
  } else {
    originalFormat.call(this, name, value);
  }
};
/* -------------------------------------------------------------------------- */

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/* ---------------- state ---------------- */
const content = ref(props.modelValue)
const quillInstance: Ref<Quill | null> = ref(null)
const isUploading = ref(false)
const uploadingImages = ref<UploadingImage[]>([])

const avgProgress = computed(() => {
  if (uploadingImages.value.length === 0) return 0
  const sum = uploadingImages.value.reduce((a, b) => a + b.progress, 0)
  return Math.floor(sum / uploadingImages.value.length)
})

/* ---------------- constants ---------------- */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

/* ---------------- utils ---------------- */
const validateImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.')
    return false
  }
  if (file.size > MAX_IMAGE_SIZE) {
    alert('이미지는 5MB 이하만 가능합니다.')
    return false
  }
  return true
}

const uploadImageAndGetUrl = async (file: File): Promise<string> => {
  const data = await getPresignedUrl(file)
  if (!data || !data.presignedUrl) {
    throw new Error('Presigned URL을 받지 못했습니다.')
  }
  await uploadToS3(data.presignedUrl, file)

  const publicUrl = (data as any).imageUrl || getPublicImageUrl(data.presignedUrl)
  if (!publicUrl) {
    throw new Error('이미지 URL 추출에 실패했습니다.')
  }
  return publicUrl
}

/* ---------------- core upload logic ---------------- */
const uploadAndInsertImage = async (file: File) => {
  if (!quillInstance.value || !validateImage(file)) return

  const quill = quillInstance.value
  const item: UploadingImage = {
    id: crypto.randomUUID(),
    file,
    progress: 0,
  }

  // ... (state, timer, localUrl 선언 부분은 동일) ...
    uploadingImages.value.push(item)
    isUploading.value = true

    const timer = setInterval(() => {
        item.progress = Math.min(item.progress + 10, 90)
    }, 100)

    const localUrl = URL.createObjectURL(file)
    let cur: number | null = null

    try {
    const range = quill.getSelection(true)
    const insertIndex = range ? range.index : quill.getLength() // Math.max(quill.getLength() - 1, 0) 대신 quill.getLength()로 마지막 위치 사용
    cur = insertIndex

    // 1️⃣ 로컬 이미지 삽입
    console.log('[Debug] 임시 이미지 삽입 시도:', localUrl)

    // insertEmbed 실행 (이제 sanitize가 패치되었으므로 blob 주소가 유지되어야 함)
    quill.insertEmbed(insertIndex, 'image', localUrl, 'user') // <--- 첫 번째 삽입만 유지

    // 2️⃣ ID 부여 및 스타일링
    // insertEmbed 직후 해당 인덱스의 Leaf(Blot)를 찾는 것이 가장 안전
    const [leaf] = quill.getLeaf(insertIndex)
    if (leaf && leaf.domNode instanceof HTMLElement) {
        leaf.domNode.setAttribute('data-upload-id', item.id)
        leaf.domNode.classList.add('uploading')

        // leaf.format 호출은 제거하고, 중복 호출된 insertEmbed 제거
        console.log('[Debug] 이미지 삽입 및 ID 부여 성공:', item.id)
    }

    // 커서 정리 (⭐ 이 부분을 수정합니다.)
    // 이미지 Blot은 길이 1. Quill이 자동으로 뒤에 문단(P) 블록을 만들어주므로
    // 명시적인 \n 추가 없이 커서를 이미지 다음 위치(새 문단 시작)로 옮깁니다.
    // 만약 Quill이 \n을 자동으로 추가한다면, cur + 2 위치가 가장 안전합니다.
    // 하지만 대부분은 cur + 1로 커서를 옮긴 후 사용자가 엔터를 치게 유도하는 게 좋습니다.

    // 1. 이미지가 삽입된 위치: cur
    // 2. 이미지 Blot의 길이: 1
    // 3. 커서가 위치할 곳: cur + 1
    quill.setSelection(cur + 1, 0, 'silent');

    // 3️⃣ S3 업로드
    // ... (S3 업로드 로직은 동일) ...

    const resizedFile = await resizeImage(file, 1000, 1000, 0.8)
    const finalUrl = await uploadImageAndGetUrl(resizedFile)

    clearInterval(timer)
    item.progress = 100

    // 4️⃣ 이미지 교체
    // ... (이미지 교체 로직은 동일) ...
    console.log('[Debug] 교체 프로세스 시작. 아이디:', item.id);

    // DOM에서 찾기
    const targetImg = quill.root.querySelector(`img[data-upload-id="${item.id}"]`)

    if (targetImg) {
       // 이제 src가 //:0 이 아니라 blob:... 일 것이므로 Quill.find가 동작할 확률 매우 높음
        let blot = Quill.find(targetImg)

        // 만약 Quill.find가 실패하면 최후의 수단으로 index 기반 탐색 (Fallback)
        if (!blot && cur !== null) {
            console.warn('[Debug] Quill.find 실패, 인덱스로 재시도');
            const [fallbackLeaf] = quill.getLeaf(cur);
            if (fallbackLeaf && fallbackLeaf.domNode === targetImg) {
                blot = fallbackLeaf;
            }
        }

    if (blot) {
        const index = quill.getIndex(blot)
        console.log('[Debug] Blot 인덱스 확인:', index);

        // 기존 이미지 삭제 후 새 이미지 삽입
        quill.deleteText(index, 1, 'user')
        quill.insertEmbed(index, 'image', finalUrl, 'user')

        // ✅ 수정: 교체 후 커서 안정화
        quill.setSelection(index + 1, 0, 'silent');
        quill.focus(); // 포커스 재설정else {
        console.warn('[Debug] 이미지가 DOM에서 사라짐.');
    }

    URL.revokeObjectURL(localUrl)

    }
  }catch (e) {
    console.error('업로드 실패:', e)
    alert('이미지 업로드 실패')

    // ✅ 수정: cur이 유효한지 확인하고, deleteText 호출 전에 포커스를 설정하여 안전성을 높임
    if (cur !== null) {
        const length = quill.getLength();
        // 삭제 범위가 현재 문서 길이를 초과하지 않도록 보장
        const deleteLength = Math.min(2, length - cur);

        if (deleteLength > 0) {
             quill.focus(); // 삭제 전에 에디터에 포커스를 줍니다.
             quill.deleteText(cur, deleteLength, 'user')
        }
    }
    URL.revokeObjectURL(localUrl)
  }finally {
    uploadingImages.value = uploadingImages.value.filter(img => img.id !== item.id)
    if (uploadingImages.value.length === 0) isUploading.value = false
    }
}

/* ---------------- handlers ---------------- */
const handleDrop = (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files ?? [])
    .filter(f => f.type.startsWith('image/'))
  files.forEach(uploadAndInsertImage)
}

const handleToolbarImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) uploadAndInsertImage(file)
  }
  input.click()
}

const onReady = (quill: Quill) => {
  quillInstance.value = quill;
  const toolbar = quill.getModule('toolbar') as any;
  if(toolbar) toolbar.addHandler('image', handleToolbarImage);

  quill.root.addEventListener('dragover', (e: DragEvent) => e.preventDefault())
  quill.root.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault()
    handleDrop(e)
  })

  quill.root.addEventListener('click', (e: MouseEvent) => {
    const img = e.target as HTMLImageElement
    if (img.tagName === 'IMG') {
      if (confirm('이미지를 삭제할까요?')) {
        const blot = Quill.find(img)
        if (blot && !(blot instanceof Quill)) {
          const index = quillInstance.value?.getIndex(blot) ?? -1
          if (index >= 0) {
            quill.deleteText(index, 1, 'user')
            quill.focus()
          }
        }
      }
    }
  })
}

/* ---------------- sync ---------------- */
watch(
  () => props.modelValue,
  v => { if (v !== content.value) content.value = v }
)

const updateContent = (html: string) => {
  content.value = html
  emit('update:modelValue', html)
}
</script>
