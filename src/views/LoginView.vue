<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })

    if (success) {
      router.push('/') // Redirect to home on successful login
    } else {
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
      password.value = '' // Clear password field
    }
  } finally {
    isLoading.value = false
  }
}

function goToHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4 font-sans">
    <div
      class="w-full max-w-sm rounded-xl border-2 border-[#2C2C2C] bg-white p-8 shadow-[3px_3px_0px_0px_rgba(44,44,44,0.1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(44,44,44,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
    >
      <div class="text-center">
        <h1
          @click="goToHome"
          class="mb-2 cursor-pointer text-4xl font-black text-[#E88555] transition-transform hover:scale-105"
        >
          TRIT
        </h1>
        <p class="mb-8 text-sm font-medium text-gray-500">
          여행의 모든 순간, TRIT과 함께
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
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

        <button
          type="submit"
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-lg border-2 border-[#2C2C2C] bg-[#E88555] p-3 font-black text-white transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#2C2C2C] focus:outline-none disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:shadow-none"
        >
          <div
            v-if="isLoading"
            class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          ></div>
          <span>{{ isLoading ? '로그인 중...' : '로그인' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs font-medium text-gray-500">
        <a href="#" class="hover:text-[#E88555] hover:underline">아이디 찾기</a>
        <span class="mx-2">|</span>
        <a href="#" class="hover:text-[#E88555] hover:underline">비밀번호 찾기</a>
        <span class="mx-2">|</span>
        <a href="#" class="hover:text-[#E88555] hover:underline">회원가입</a>
      </div>
    </div>
  </div>
</template>
