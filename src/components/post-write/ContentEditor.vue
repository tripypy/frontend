<template>
  <div class="relative border border-gray-300 rounded-xl overflow-hidden">
    <!-- Upload Overlay -->
    <div
      v-if="isUploading"
      class="absolute inset-0 z-10 bg-white/70 flex flex-col items-center justify-center gap-2 p-4"
    >
      <div
        v-for="img in uploadingImages"
        :key="img.id"
        class="w-full max-w-sm"
      >
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>이미지 업로드 중</span>
          <span>{{ img.progress }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded">
          <div
            class="h-2 bg-black rounded transition-all"
            :style="{ width: img.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
      class="border-b border-gray-200 p-3 text-sm text-gray-500 text-center"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      이미지를 드래그해서 업로드
    </div>

    <!-- Editor -->
    <QuillEditor
      theme="snow"
      contentType="html"
      :content="content"
      @update:content="updateContent"
      @ready="onReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
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
    const index = range ? range.index : quillInstance.value.getLength()

    quillInstance.value.insertEmbed(index, 'image', url, 'user')
    quillInstance.value.setSelection(index + 1, 0)
  } catch (e) {
    console.error(e)
    alert('이미지 업로드 실패')
  } finally {
    isUploading.value = false
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

  // toolbar image override
  quill.getModule('toolbar')?.addHandler('image', handleToolbarImage)

  // image click delete
  quill.root.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && confirm('이미지를 삭제할까요?')) {
      target.remove()
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
