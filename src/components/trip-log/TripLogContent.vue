<template>
  <div :class="['flex h-full bg-white', layout === 'horizontal' ? 'flex-row' : 'flex-col']">
    <!-- Main Content Section (Left in Horizontal) -->
    <div :class="[
      layout === 'horizontal' 
        ? 'flex-1 h-full overflow-y-auto no-scrollbar relative' 
        : 'w-full flex-shrink-0'
    ]">
      <!-- Header -->
      <div
        v-if="showHeader"
        class="p-5 flex items-center justify-between bg-gradient-to-br from-[#FFD60A]/10 to-white"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 border-[2px] border-[#2C2C2C] rounded-full overflow-hidden shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]"
          >
            <img :src="logDetail.authorImageUrl" :alt="logDetail.authorNickname" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="font-black text-[#2C2C2C] font-sans">{{ logDetail.authorNickname }}</h4>
            <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
              <MapPin class="w-3 h-3" stroke-width="2.5" />
              <span>{{ logDetail.locationSummary }}</span>
              <span>•</span>
              <Calendar class="w-3 h-3" stroke-width="2.5" />
              <span>{{ formattedDate }}</span>
            </div>
          </div>
        </div>
        <div class="relative" ref="dropdownContainer">
          <button
            @click="showDropdown = !showDropdown"
            class="p-2 hover:bg-gray-100 rounded transition-all"
          >
            <MoreHorizontal class="w-6 h-6 text-[#2C2C2C]" stroke-width="2.5" />
          </button>

          <div
            v-if="showDropdown"
            class="absolute right-0 top-full mt-2 w-40 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.2)] overflow-hidden z-20"
          >
            <button
              @click="handleShare"
              class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Share class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
              <span class="font-bold text-sm text-[#2C2C2C]">공유</span>
            </button>

            <template v-if="isAuthor">
              <button
                @click="handleEdit"
                class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left border-t border-gray-200"
              >
                <Edit class="w-4 h-4 text-[#2C2C2C]" stroke-width="2.5" />
                <span class="font-bold text-sm text-[#2C2C2C]">수정</span>
              </button>

              <button
                @click="handleDelete"
                class="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
              >
                <Trash2 class="w-4 h-4 text-red-500" stroke-width="2.5" />
                <span class="font-bold text-sm text-red-500">삭제</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Content Body -->
      <div class="p-5 border-b border-gray-200">
        <h3 class="font-black text-lg mb-2 text-[#2C2C2C] font-sans">{{ logDetail.title }}</h3>

        <div v-if="groupedCourse.length > 0" class="mb-4">
          <!-- Tabs -->
          <div class="flex items-center border-b-2 border-gray-200">
            <button
              v-for="day in groupedCourse"
              :key="day.dayNumber"
              @click.stop="activeDay = day.dayNumber"
              :class="[
                'px-3 py-1 font-bold text-xs transition-all',
                activeDay === day.dayNumber
                  ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C]'
                  : 'text-gray-500 hover:text-gray-800',
              ]"
            >
              DAY {{ day.dayNumber }}
            </button>
          </div>

          <!-- Course Content -->
          <div class="pt-3">
            <div v-for="day in groupedCourse" :key="day.dayNumber">
              <Transition name="no-animation">
                <div v-show="activeDay === day.dayNumber">
                  <div class="flex items-center flex-wrap gap-x-1.5 gap-y-2">
                    <div
                      v-for="(place, index) in day.places"
                      :key="index"
                      class="flex items-center gap-1.5"
                    >
                      <div
                        @click.stop="emit('place-click', place.id)"
                        class="flex items-center gap-1 px-2.5 py-1 border-[2px] border-[#2C2C2C] rounded-full bg-white shadow-[1px_1px_0px_0px_rgba(44,44,44,0.1)] course-badge cursor-pointer"
                        :style="{ '--hover-color': getBadgeColor(index) }"
                      >
                        <span class="text-xs font-black text-[#2C2C2C]">{{ index + 1 }}</span>
                        <span class="text-xs font-black text-[#2C2C2C] whitespace-nowrap">{{
                          place.name
                        }}</span>
                      </div>
                      <ChevronRight
                        v-if="index < day.places.length - 1"
                        class="w-3 h-3 text-gray-400 flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div class="prose max-w-none text-sm font-medium text-gray-800 leading-relaxed break-words" v-html="formattedContent"></div>
      </div>
    </div>

    <!-- Comments & Footer Section (Right in Horizontal) -->
    <div :class="[
      layout === 'horizontal' 
        ? 'w-[35%] h-full flex flex-col border-l border-gray-200' 
        : 'flex-1 flex flex-col min-h-0'
    ]">
      <!-- Comments List -->
      <div class="flex-1 overflow-y-auto p-4 pt-3 space-y-4">
        <template v-if="logDetail.comments && logDetail.comments.length > 0">
          <div v-for="comment in logDetail.comments" :key="comment.commentId" class="flex items-start gap-3">
            <div
              :class="[
                'border-[2px] border-[#2C2C2C] rounded-full overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] cursor-pointer hover:opacity-80',
                layout === 'horizontal' ? 'w-8 h-8' : 'w-10 h-10'
              ]"
              @click="navigateToUserLog(comment.authorId)"
            >
              <img :src="comment.authorImageUrl" :alt="comment.authorNickname" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0 flex items-start">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span 
                    :class="['font-black text-[#2C2C2C] cursor-pointer hover:underline', layout === 'horizontal' ? 'text-xs' : 'text-sm']"
                    @click="navigateToUserLog(comment.authorId)"
                  >
                    {{ comment.authorNickname }}
                  </span>
                  <span :class="['font-bold text-gray-400', layout === 'horizontal' ? 'text-[10px]' : 'text-xs']">{{ formatCommentDate(comment.createdAt) }}</span>
                </div>

                <div v-if="editingCommentId === comment.commentId" class="flex flex-col gap-2">
                   <input
                      v-model="editingContent"
                      type="text"
                      ref="editInputRef"
                      class="w-full border-[2px] border-[#2C2C2C] rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#2C2C2C]"
                      @keydown.enter.prevent="handleEditKeydown($event, comment.commentId)"
                      @keydown.esc="cancelEditComment"
                    />
                    <div class="flex justify-end gap-2">
                      <button @click="cancelEditComment" class="text-xs font-bold text-gray-500 hover:text-gray-700">취소</button>
                      <button @click="handleUpdateComment(comment.commentId)" class="text-xs font-bold text-blue-500 hover:text-blue-700">저장</button>
                    </div>
                </div>
                <p v-else :class="['font-medium text-gray-800 leading-relaxed break-all', layout === 'horizontal' ? 'text-xs' : 'text-sm']">{{ comment.content }}</p>
              </div>

              <div v-if="authStore.user?.nickname === comment.authorNickname && editingCommentId !== comment.commentId" class="relative ml-2 flex-shrink-0">
                <button 
                  @click.stop="toggleCommentDropdown(comment.commentId)"
                  class="p-1 hover:bg-gray-100 rounded-full transition-colors -mt-1"
                  :data-comment-dropdown-trigger="comment.commentId"
                >
                  <MoreHorizontal class="w-4 h-4 text-gray-400" stroke-width="2" />
                </button>
                
                <div
                  v-if="activeCommentDropdownId === comment.commentId"
                  class="absolute right-0 top-full mt-1 w-20 bg-white border-[2px] border-[#2C2C2C] rounded-lg shadow-[4px_4px_0px_0px_rgba(44,44,44,0.2)] overflow-hidden z-10"
                  :data-comment-dropdown-menu="comment.commentId"
                >
                  <button
                    @click="handleEditClick(comment)"
                    class="w-full px-3 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors text-xs font-bold text-[#2C2C2C] border-b border-gray-100"
                  >
                    수정
                  </button>
                  <button
                    @click="handleDeleteClick(comment.commentId)"
                    class="w-full px-3 py-2 flex items-center justify-center hover:bg-red-50 transition-colors text-xs font-bold text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-60">
            <MessageCircle class="w-12 h-12 mb-2 text-gray-300" stroke-width="1.5" />
            <p class="text-sm font-bold text-gray-400">댓글이 아직 없어요</p>
            <p class="text-xs text-gray-400">첫 번째 댓글을 남겨보세요!</p>
        </div>
      </div>

      <!-- Footer: Actions & Input -->
      <div class="border-t border-gray-200 bg-white">
        <div class="p-4 flex items-center gap-2">
          <button
            @click="handleLike"
            :class="[
              'flex items-center gap-1.5 border-[2px] border-[#2C2C2C] rounded-full font-black text-xs transition-all uppercase',
              layout === 'horizontal' ? 'px-3 py-1.5' : 'px-4 py-2.5',
              isLiked
                ? 'bg-[#FF6B9D] text-white shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
                : 'bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]',
            ]"
          >
            <Heart :class="[layout === 'horizontal' ? 'w-3.5 h-3.5' : 'w-4 h-4', isLiked ? 'fill-current' : '']" stroke-width="2.5" />
            <span>{{ currentLikes }}</span>
          </button>

          <button
            @click="handleScrap"
            :disabled="isScrapping"
            :class="[
              'flex items-center justify-center border-[2px] border-[#2C2C2C] rounded-full transition-all focus:outline-none',
              layout === 'horizontal' ? 'w-8 h-8' : 'w-10 h-10',
              isBookmarked
                ? 'bg-[#98D8C8] shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]'
                : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]',
              isScrapping && 'opacity-50 cursor-not-allowed',
            ]"
          >
            <Bookmark
              :class="[layout === 'horizontal' ? 'w-4 h-4' : 'w-5 h-5', isBookmarked ? 'text-[#2C2C2C] fill-[#2C2C2C]' : 'text-[#2C2C2C]']"
              stroke-width="2.5"
            />
          </button>

          <button
            @click="handleShare"
            :class="[
              'flex items-center justify-center border-[2px] border-[#2C2C2C] rounded-full bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)] transition-all focus:outline-none',
              layout === 'horizontal' ? 'w-8 h-8' : 'w-10 h-10'
            ]"
          >
            <Share2
              :class="[layout === 'horizontal' ? 'w-4 h-4' : 'w-5 h-5', 'text-[#2C2C2C]']"
              stroke-width="2.5"
            />
          </button>
        </div>

        <div class="p-4 pt-0">
          <form @submit.prevent="handleCommentSubmit" class="flex items-center gap-2.5">
            <div
              :class="[
                'border-[2px] border-[#2C2C2C] rounded-full overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(44,44,44,0.1)]',
                layout === 'horizontal' ? 'w-8 h-8' : 'w-10 h-10'
              ]"
            >
               <img
                v-if="authStore.isLoggedIn && authStore.user?.profileImageUrl"
                :src="authStore.user.profileImageUrl"
                alt="My Profile"
                class="w-full h-full object-cover"
              />
              <img
                v-else
                src="/default-profile.svg"
                alt="Default Profile"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="relative flex-1">
              <input
                v-model="newComment"
                :disabled="!authStore.isLoggedIn"
                type="text"
                :placeholder="
                  authStore.isLoggedIn ? '댓글을 입력하세요...' : '로그인 후 댓글을 남길 수 있습니다.'
                "
                :class="[
                  'w-full border-[2px] border-[#2C2C2C] rounded-lg font-medium bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(107,143,212,0.3)] transition-all placeholder:text-gray-400',
                  layout === 'horizontal' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
                  !authStore.isLoggedIn ? 'bg-gray-100' : '',
                ]"
                @keydown.enter.prevent="handleKeydownSubmit"
              />
              <div
                v-if="!authStore.isLoggedIn"
                @click="emit('login-required')"
                class="absolute inset-0 cursor-pointer"
              ></div>
            </div>
            <button
              type="submit"
              :disabled="!authStore.isLoggedIn"
              :class="[
                'border-[2px] border-[#2C2C2C] rounded-lg font-black bg-[#F9CA6B] text-[#2C2C2C] hover:shadow-[3px_3px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed',
                layout === 'horizontal' ? 'px-3 py-2 text-[10px]' : 'px-5 py-3 text-xs'
              ]"
            >
              작성
            </button>
          </form>
        </div>
      </div>
    </div>
    
     <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-[-20px]"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-[-20px]"
    >
      <div
        v-if="showToast"
        class="fixed top-6 right-6 z-[80] bg-white border-[3px] border-[#2C2C2C] rounded-xl shadow-[4px_4px_0px_0px_rgba(44,44,44,0.3)] px-5 py-3 flex items-center gap-3"
      >
        <div class="w-6 h-6 bg-[#FFD60A] border-[2px] border-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#2C2C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="font-black text-sm text-[#2C2C2C]">
          {{ isBookmarked ? '내 여행에 추가되었습니다' : '링크가 복사되었습니다!' }}
        </span>
      </div>
    </Transition>

    <AlertDialog
      :show="alertState.show"
      :title="alertState.title"
      :message="alertState.message"
      :show-cancel-button="alertState.showCancelButton"
      @close="closeAlert"
      @confirm="alertState.onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Heart,
  Bookmark,
  MapPin,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Share2,
  Edit,
  Trash2,
  MessageCircle,
} from 'lucide-vue-next'
import AlertDialog from '@/components/common/AlertDialog.vue'
import { format, parseISO } from 'date-fns'
import type { TripLogDetail } from '@/types/trip/trip.model'
import type { TripDetailResponseDto } from '@/apis/trip/types'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { likeTripLog, unlikeTripLog, postTripLogComment, getTripLogDetail, getTripLogLikeStatus, updateTripLogComment, deleteTripLogComment } from '@/apis/trip-log/index'
// import { requestScrapTrip } from '@/apis/trip/index'

const props = withDefaults(defineProps<{
  logDetail: TripLogDetail
  tripDetail: TripDetailResponseDto | null
  initialLiked: boolean
  showHeader?: boolean
  layout?: 'vertical' | 'horizontal'
}>(), {
  showHeader: true,
  layout: 'vertical'
})

const emit = defineEmits(['update-like', 'place-click', 'login-required', 'refresh-comments', 'edit', 'delete'])

const authStore = useAuthStore()
const router = useRouter()

const showDropdown = ref(false)
const showToast = ref(false)
const activeDay = ref(1)
const newComment = ref('')
const isBookmarked = ref(false) // Local state for bookmark (Mock)
const isLiked = ref(props.initialLiked)
const currentLikes = ref(props.logDetail.likeCount)

const alertState = ref({
  show: false,
  title: '',
  message: '',
  showCancelButton: true,
  onConfirm: () => {},
})

const closeAlert = () => {
  alertState.value.show = false
}

const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  alertState.value = {
    show: true,
    title,
    message,
    showCancelButton: true,
    onConfirm: () => {
      onConfirm()
      closeAlert()
    },
  }
}

const showAlert = (title: string, message: string) => {
  alertState.value = {
    show: true,
    title,
    message,
    showCancelButton: false,
    onConfirm: closeAlert,
  }
}

const activeCommentDropdownId = ref<number | null>(null)

const editingCommentId = ref<number | null>(null)
const editingContent = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

// Update local state when props change
watchEffect(() => {
    isLiked.value = props.initialLiked
    currentLikes.value = props.logDetail.likeCount
})

const isAuthor = computed(() => props.logDetail.authorNickname === authStore.user?.nickname) // Adjust as needed

const formattedDate = computed(() => {
  if (!props.logDetail.createdAt) return ''
  return format(parseISO(props.logDetail.createdAt), 'yyyy.MM.dd')
})

const formattedContent = computed(() => {
  if (!props.logDetail.content) return ''
  return props.logDetail.content.replace(/^[ \t]*{{\s*img_.*?\s*}}[ \t]*$\r?\n?/gm, '')
})

const groupedCourse = computed(() => {
  if (!props.tripDetail?.tripItems || props.tripDetail.tripItems.length === 0) {
    return []
  }
  const grouped = props.tripDetail.tripItems.reduce(
    (acc, item) => {
      const day = item.dayNumber
      if (!acc[day]) {
        acc[day] = { dayNumber: day, places: [] }
      }
      acc[day]!.places.push({ id: item.spot.id, name: item.spot.name })
      return acc
    },
    {} as Record<number, { dayNumber: number; places: { id: number; name: string }[] }>,
  )
  return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber)
})

watchEffect(() => {
  if (groupedCourse.value.length > 0) {
    activeDay.value = groupedCourse.value[0]!.dayNumber
  }
})

const handleLike = async () => {
  if (!authStore.isLoggedIn) {
    emit('login-required')
    return
  }

  try {
    let response
    if (isLiked.value) {
      response = await unlikeTripLog(props.logDetail.logId)
    } else {
      response = await likeTripLog(props.logDetail.logId)
    }
    isLiked.value = response.liked
    currentLikes.value = response.likeCount
    emit('update-like', { logId: props.logDetail.logId, likeCount: response.likeCount, liked: response.liked })
  } catch (e) {
    console.error('Failed to toggle like status:', e)
    showAlert('오류', '좋아요 상태 변경에 실패했습니다.')
  }
}

const isScrapping = ref(false)

const handleScrap = async () => {
  if (isScrapping.value || isBookmarked.value) return
  if (!authStore.isLoggedIn) {
    emit('login-required')
    return
  }

  try {
    isScrapping.value = true
    // const response = await requestScrapTrip(props.logDetail.logId)
    // if (response.tripId) {
    //   isBookmarked.value = true
    //   showToast.value = true
    //   setTimeout(() => {
    //     showToast.value = false
    //   }, 2500)
    // }
    alert('아직 준비 중인 기능입니다!')
  } catch (err) {
    console.error('스크랩 실패:', err)
    showAlert('오류', '스크랩에 실패했습니다.')
  } finally {
    isScrapping.value = false
  }
}

const handleCommentSubmit = async () => {
  if (!authStore.isLoggedIn) {
     emit('login-required')
    return
  }
  if (!newComment.value.trim()) return
  try {
    await postTripLogComment(props.logDetail.logId, { content: newComment.value })
    newComment.value = ''
    emit('refresh-comments')
  } catch (error) {
    console.error('Failed to post comment:', error)
    showAlert('오류', '댓글 작성에 실패했습니다.')
  }
}

const startEditComment = async (comment: any) => {
  editingCommentId.value = comment.commentId
  editingContent.value = comment.content
  await nextTick()
  if (editInputRef.value) {
    editInputRef.value.focus()
  }
}

const handleEditKeydown = (e: KeyboardEvent, commentId: number) => {
  if (e.isComposing) return
  handleUpdateComment(commentId)
}

const handleKeydownSubmit = (e: KeyboardEvent) => {
  if (e.isComposing) return
  handleCommentSubmit()
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

const handleUpdateComment = async (commentId: number) => {
  if (!editingContent.value.trim()) return
  try {
    await updateTripLogComment(commentId, { content: editingContent.value })
    editingCommentId.value = null
    editingContent.value = ''
    emit('refresh-comments')
  } catch (error) {
    console.error('Failed to update comment:', error)
    showAlert('오류', '댓글 수정에 실패했습니다.')
  }
}

const handleDeleteComment = (commentId: number) => {
  showConfirm('댓글 삭제', '댓글을 삭제하시겠습니까?', async () => {
    try {
      await deleteTripLogComment(commentId)
      emit('refresh-comments')
    } catch (error) {
      console.error('Failed to delete comment:', error)
      showAlert('오류', '댓글 삭제에 실패했습니다.')
    }
  })
}

const handleShare = () => {
  showDropdown.value = false
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast.value = true
    setTimeout(() => (showToast.value = false), 2000)
  })
}

const handleEdit = () => {
  showDropdown.value = false
  emit('edit')
}

const handleDelete = () => {
  showDropdown.value = false
  showConfirm('여행 기록 삭제', '정말 삭제하시겠습니까?', () => {
    emit('delete')
  })
}

const colors = ['#FFD60A', '#FF6B9D', '#98D8C8', '#B4E4FF', '#E88555']
const getBadgeColor = (idx: number) => colors[idx % colors.length]

const formatCommentDate = (dateString: string) => {
  const date = parseISO(dateString)
  const now = new Date()
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000)
  if (diffSeconds < 60) return `${diffSeconds}초 전`
  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  return format(date, 'yyyy.MM.dd')
}

const dropdownContainer = ref<HTMLElement | null>(null)

const handleClickOutside = (e: MouseEvent) => {
  // Main dropdown
  if (showDropdown.value && dropdownContainer.value && !dropdownContainer.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
  
  // Comment dropdowns
  if (activeCommentDropdownId.value !== null) {
    const target = e.target as HTMLElement
    const trigger = target.closest(`[data-comment-dropdown-trigger="${activeCommentDropdownId.value}"]`)
    const menu = target.closest(`[data-comment-dropdown-menu="${activeCommentDropdownId.value}"]`)
    
    if (!trigger && !menu) {
      activeCommentDropdownId.value = null
    }
  }
}

const toggleCommentDropdown = (commentId: number) => {
  if (activeCommentDropdownId.value === commentId) {
    activeCommentDropdownId.value = null
  } else {
    activeCommentDropdownId.value = commentId
  }
}

const handleEditClick = (comment: any) => {
  activeCommentDropdownId.value = null
  startEditComment(comment)
}

const handleDeleteClick = (commentId: number) => {
  activeCommentDropdownId.value = null
  handleDeleteComment(commentId)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showDropdown.value) showDropdown.value = false
    if (activeCommentDropdownId.value !== null) activeCommentDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

const navigateToUserLog = (userId: number) => {
  if (userId) {
    router.push({ name: 'user-log', params: { userId } })
  } else {
    console.warn('작성자 ID가 없습니다. API 응답을 확인해주세요.')
    // alert('정보가 부족하여 이동할 수 없습니다.') // Optional: User facing feedback
  }
}
</script>

<style scoped>
.course-badge:hover {
  background-color: var(--hover-color);
}
.no-animation-enter-active,
.no-animation-leave-active {
  transition: none;
}
</style>
