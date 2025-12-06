<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TravelNavbar from '@/components/common/TravelNavbar.vue' // Import TravelNavbar

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const nickname = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isPasswordMismatch = computed(() => {
  return password.value && passwordConfirm.value && password.value !== passwordConfirm.value
})

async function handleSignUp() {
  if (isPasswordMismatch.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (!password.value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
    errorMessage.value = '비밀번호는 8자 이상이며, 대/소문자, 숫자, 특수문자를 포함해야 합니다.'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  try {
    const success = await authStore.signup({
      email: email.value,
      password: password.value,
      nickname: nickname.value
    })
    if (success) {
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      router.push('/login')
    }
  } finally {
    isLoading.value = false
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

function goToFindAccount() {
  router.push('/find-account')
}
</script>

<template>
  <div class="relative min-h-screen bg-[#F5F5F5] font-sans pt-[100px]">
    <!-- TravelNavbar component -->
    <TravelNavbar currentPage="main" @navigate="handleNavigation" />

    <!-- Main Content -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div
        class="w-full max-w-sm rounded-xl border-2 border-[#2C2C2C] bg-white p-8 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)]"
      >
        <div class="text-center">
          <h2 class="mb-2 text-3xl font-bold text-gray-800">회원가입</h2>
          <p class="mb-6 text-sm font-medium text-gray-500">새로운 계정을 만들어 여행을 기록하세요</p>
        </div>

        <form @submit.prevent="handleSignUp" class="space-y-4">
          <div>
            <label for="email" class="sr-only">이메일</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="이메일"
              required
              class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0"
            />
          </div>

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

          <div>
            <label for="password" class="sr-only">비밀번호</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="비밀번호"
              required
              class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label for="passwordConfirm" class="sr-only">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              v-model="passwordConfirm"
              placeholder="비밀번호 확인"
              required
              class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0"
              :class="{ 'border-red-500': isPasswordMismatch }"
            />
          </div>

          <p v-if="errorMessage" class="text-xs text-red-500 text-center">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading || isPasswordMismatch"
            class="flex w-full items-center justify-center rounded-lg border-2 border-[#2C2C2C] bg-[#E88555] p-3 font-black text-white transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#2C2C2C] focus:outline-none disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:shadow-none"
          >
            <div
              v-if="isLoading"
              class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
            <span>{{ isLoading ? '가입하는 중...' : '회원가입' }}</span>
          </button>
        </form>

        <hr class="my-6 border-gray-300" />

        <div class="space-y-3 text-center text-xs font-medium text-gray-500">
          <p>
            계정이 이미 있는 경우에는
            <router-link to="/login" class="font-bold text-[#E88555] hover:underline"
              >로그인</router-link
            >해주세요.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
