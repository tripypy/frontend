<style scoped>
:deep(.ql-editor) {
  min-height: 280px;
  padding: 16px;
  font-size: 17px;
  line-height: 1.75;
}

:deep(.ql-container) {
  border: none;
}
</style>
<template>
  <div class="relative border border-gray-300 rounded-xl overflow-hidden">
    <div
      v-if="isUploading"
      class="absolute inset-0 z-20
            bg-white/80
            flex flex-col items-center justify-center
            gap-4"
    >
      <!-- Spinner -->
      <div
        class="w-10 h-10 border-4 border-gray-300
              border-t-black rounded-full animate-spin" />
      <!-- Progress -->
      <div class="w-64">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>이미지 업로드 중</span>
          <span>{{ avgProgress }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded">
          <div
            class="h-2 bg-black rounded transition-all"
            :style="{ width: avgProgress + '%' }"
          ></div>
        </div>
      </div>

      <p class="text-xs text-gray-500">
        업로드 중에는 본문을 작성할 수 없습니다
      </p>
    </div>


    <!-- Drop Zone -->
    <div
      class="flex flex-col items-center justify-center gap-2
            h-32 border-2 border-dashed border-gray-300
            rounded-t-xl text-gray-500 text-sm
            hover:border-gray-400 transition
            bg-gray-50"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <!-- + 아이콘 -->
      <div class="text-3xl font-light">＋</div>
      <p>이미지를 드래그해서 업로드</p>
    </div>

    <!-- Editor -->
    <div class="relative">
      <QuillEditor
        class="min-h-[300px]"
        :class="{ 'pointer-events-none opacity-60': isUploading }"
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
import { ref, watch, computed, type Ref } from 'vue'
import { getPresignedUrl} from '@/apis/trip-log/index'
import { uploadToS3, getPublicImageUrl } from '@/composables/trip-log/useImageUpload'
import type { UploadingImage } from '@/types/image/image.model'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/* ---------------- state ---------------- */
const content = ref(props.modelValue)
const quillInstance: Ref<any> = ref(null)
const isUploading = ref(false)
const uploadingImages = ref<UploadingImage[]>([])
//const uploadError = ref<string | null>(null)

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

const uploadImageAndGetUrl = async (
  file: File
): Promise<string> => {
  const { presignedUrl } = await getPresignedUrl(file)
  // S3에 PUT 업로드
  await uploadToS3(presignedUrl, file)
  // 영구 URL 반환
  return getPublicImageUrl(presignedUrl)
}

/* ---------------- core upload logic ---------------- */
const uploadAndInsertImage = async (file: File) => {
  if (!quillInstance.value || !validateImage(file)) return

  const item: UploadingImage = {
    id: crypto.randomUUID(),
    file,
    progress: 0,
  }

  uploadingImages.value.push(item)
  isUploading.value = true

  const timer = setInterval(() => {
    item.progress = Math.min(item.progress + 10, 90)
  }, 100)

  try {
    const url = await uploadImageAndGetUrl(file)

    clearInterval(timer)
    item.progress = 100
    item.url = url

    const range = quillInstance.value.getSelection(true)

    if (!range) {
      quillInstance.value.insertEmbed(quillInstance.value.getLength(), 'image', url)
      return
    }

    const index = range ? range.index : quillInstance.value.getLength()

    quillInstance.value.insertEmbed(index, 'image', url, 'user')
    quillInstance.value.insertText(index + 1, '\n', 'user')
    quillInstance.value.setSelection(index + 2, 0)
  } catch (e) {
    console.error(e)
    alert('이미지 업로드 실패')
  } finally {
    uploadingImages.value = uploadingImages.value.filter(
      img => img.id !== item.id
    )

    if (uploadingImages.value.length === 0) {
      isUploading.value = false
    }
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

/* ---------------- quill setup ---------------- */
const onReady = (quill: any) => {
  quillInstance.value = quill

  quill.getModule('toolbar')?.addHandler('image', handleToolbarImage)

  quill.root.addEventListener('mouseover', e => {
    const img = e.target as HTMLImageElement
    if (img.tagName === 'IMG') {
      img.style.outline = '2px solid #000'
      img.style.cursor = 'pointer'
    }
  })

  quill.root.addEventListener('mouseout', e => {
    const img = e.target as HTMLImageElement
    if (img.tagName === 'IMG') {
      img.style.outline = 'none'
    }
  })

  quill.root.addEventListener('click', e => {
    const img = e.target as HTMLImageElement
    if (img.tagName === 'IMG') {
      if (confirm('이미지를 삭제할까요?')) {
        img.remove()
        emit('update:modelValue', quill.root.innerHTML)
      }
    }
  })
}

/* ---------------- sync ---------------- */
watch(
  () => props.modelValue,
  v => {
    if (v !== content.value) content.value = v
  }
)

const updateContent = (html: string) => {
  content.value = html
  emit('update:modelValue', html)
}
</script>
