<template>
    <div class="p-4">
    <ContentEditor
        v-model="content"
        ref="editorRef"
    />

    <div class="mt-4 flex justify-end gap-2">
        <button
        class="btn btn-secondary"
        @click="onCancel"
        >
        취소
        </button>
        <button
        class="btn btn-primary"
        @click="onSubmit"
        :disabled="isSubmitting"
        >
        {{ isSubmitting ? '저장 중...' : '수정 완료' }}
        </button>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ContentEditor from '@/components/log-write/ContentEditor.vue'
import { getTripLogDetail, patchTripLog } from '@/apis/trip-log'
import type { TripLogDetail, TripVisibility } from '@/types/trip/trip.model'

interface Props {
logId: number
onClose?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
(e: 'updated'): void
}>()

const content = ref('')
const title = ref('')
const visibility = ref<TripVisibility>('PUBLIC')
const isSubmitting = ref(false)
const editorRef = ref<InstanceType<typeof ContentEditor> | null>(null)

const fetchLog = async () => {
try {
const log: TripLogDetail = await getTripLogDetail(props.logId)
content.value = log.content
title.value = log.title
visibility.value = log.images.length > 0 ? 'PUBLIC' : 'PRIVATE' // 예시
} catch (e) {
console.error(e)
alert('로그를 불러오는 중 오류가 발생했습니다.')
}
}

onMounted(() => {
fetchLog()
})

const onSubmit = async () => {
    isSubmitting.value = true
    try {
        const params = {
            logId: props.logId, 
            payload: {
                title: title.value,
                content: content.value,
                visibility: visibility.value,
            }
        }
        await patchTripLog(params)
        emit('updated')
        props.onClose?.()
    } catch (e) {
        console.error(e)
        alert('로그 수정에 실패했습니다.')
    } finally {
    
    }
}

const onCancel = () => {
    props.onClose?.()
}
</script>
