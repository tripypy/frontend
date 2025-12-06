<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TravelNavbar from '@/components/common/TravelNavbar.vue' // Import TravelNavbar

const router = useRouter()
const authStore = useAuthStore()

// For Find ID
const nickname = ref('')
const foundEmail = ref<string | null>(null)
const findIdError = ref<string | null>(null)
const isFindIdLoading = ref(false)

// For Find Password
const emailForPassword = ref('')
const isPasswordResetLoading = ref(false)
const isPasswordResetSubmitted = ref(false)

async function handleFindId() {
  if (!nickname.value) return
  isFindIdLoading.value = true
  foundEmail.value = null
  findIdError.value = null
  try {
    const result = await authStore.findEmailByNickname(nickname.value)
    foundEmail.value = result
  } catch (error: any) {
    findIdError.value = error.message || '아이디 찾기 중 오류가 발생했습니다.'
  } finally {
    isFindIdLoading.value = false
  }
}

async function handlePasswordReset() {
  if (!emailForPassword.value) return
  isPasswordResetLoading.value = true
  try {
    await authStore.resetPassword(emailForPassword.value);
    isPasswordResetSubmitted.value = true
  } finally {
    isPasswordResetLoading.value = false
  }
}

function handleNavigation(page: 'main' | 'search' | 'trips' | 'log') {
  switch (page) {
    case 'main':
      router.push({ name: 'home' })
      break
    case 'search':
      router.push({ name: 'search' })
      break
    case 'trips':
      router.push({ name: 'trips' })
      break
    case 'log':
      router.push({ name: 'log' })
      break
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="relative min-h-screen bg-[#F5F5F5] font-sans pt-[100px]">
    <!-- TravelNavbar component -->
    <TravelNavbar currentPage="main" @navigate="handleNavigation" />

    <!-- Main Content -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="space-y-8">
          <!-- Find ID Card -->
          <div
            class="rounded-xl border-2 border-[#2C2C2C] bg-white p-8 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)] transition-all"
          >
            <div class="text-center">
              <h1 class="mb-2 text-3xl font-black text-[#E88555]">아이디 찾기</h1>
              <p class="mb-6 text-sm font-medium text-gray-500">
                가입 시 사용한 닉네임을 입력해주세요.
              </p>
            </div>

            <form @submit.prevent="handleFindId" class="space-y-4">
              <div>
                <label for="nickname" class="sr-only">닉네임</label>
                <input
                  type="text"
                  id="nickname"
                  v-model="nickname"
                  placeholder="닉네임"
                  required
                  class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                :disabled="isFindIdLoading"
                class="flex w-full items-center justify-center rounded-lg border-2 border-[#2C2C2C] bg-[#E88555] p-3 font-black text-white transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#2C2C2C] focus:outline-none disabled:opacity-70"
              >
                <div
                  v-if="isFindIdLoading"
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span>{{ isFindIdLoading ? '찾는 중...' : '이메일 찾기' }}</span>
              </button>
            </form>

            <div
              v-if="foundEmail"
              class="mt-4 rounded-lg bg-green-100 p-3 text-center text-sm font-bold text-green-800"
            >
              회원님의 이메일은<br />{{ foundEmail }} 입니다.
            </div>
            <div
              v-if="findIdError"
              class="mt-4 rounded-lg bg-red-100 p-3 text-center text-sm font-medium text-red-700"
            >
              {{ findIdError }}
            </div>
          </div>

          <!-- Find Password Card -->
          <div
            class="rounded-xl border-2 border-[#2C2C2C] bg-white p-8 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)] transition-all"
          >
            <div class="text-center">
              <h1 class="mb-2 text-3xl font-black text-[#E88555]">비밀번호 찾기</h1>
              <p class="mb-6 text-sm font-medium text-gray-500">
                가입한 이메일을 입력하시면 임시 비밀번호를 보내드립니다.
              </p>
            </div>

            <div v-if="isPasswordResetSubmitted" class="text-center">
              <p class="mb-4 text-sm font-medium text-gray-700">
                입력하신 이메일로 임시 비밀번호가 발송되었습니다.<br />
                메일을 확인해주세요. (스팸함도 확인해보세요)
              </p>
            </div>
            <form v-else @submit.prevent="handlePasswordReset" class="space-y-4">
              <div>
                <label for="email" class="sr-only">이메일</label>
                <input
                  type="email"
                  id="email"
                  v-model="emailForPassword"
                  placeholder="가입한 이메일 주소"
                  required
                  class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                :disabled="isPasswordResetLoading"
                class="flex w-full items-center justify-center rounded-lg border-2 border-[#2C2C2C] bg-[#E88555] p-3 font-black text-white transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#2C2C2C] focus:outline-none disabled:opacity-70"
              >
                <div
                  v-if="isPasswordResetLoading"
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span>{{ isPasswordResetLoading ? '전송 중...' : '임시 비밀번호 전송' }}</span>
              </button>
            </form>
          </div>
        </div>

        <hr class="my-6 border-gray-300" />

        <div class="text-center text-sm font-medium text-gray-500">
          <p>
            계정이 기억나셨다면
            <router-link to="/login" class="font-bold text-[#E88555] hover:underline"
              >로그인</router-link
            >
            해보시겠어요?
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
