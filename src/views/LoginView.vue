<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TravelNavbar from '@/components/common/TravelNavbar.vue' // Import TravelNavbar
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const isPasswordVisible = ref(false)

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}

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
          <h2 class="mb-2 text-3xl font-bold text-gray-800">로그인</h2>
          <p class="mb-8 text-sm font-medium text-gray-500">여행의 모든 순간, TRIT과 함께</p>
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
            <div class="relative">
              <label for="password" class="sr-only">비밀번호</label>
              <input
                :type="isPasswordVisible ? 'text' : 'password'" 
                id="password"
                v-model="password"
                placeholder="비밀번호"
                required
                class="w-full rounded-lg border-2 border-[#2C2C2C] bg-white p-3 text-sm font-medium transition-all placeholder:font-medium focus:border-[#E88555] focus:outline-none focus:ring-0 pr-12"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#E88555]"
              >
                <EyeIcon v-if="isPasswordVisible" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
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

        <hr class="my-6 border-gray-300" />

        <div class="space-y-3 text-center text-xs font-medium text-gray-500">
          <p>
            아이디나 비밀번호를 잊었을 때는,
            <router-link to="/find-account" class="font-bold text-[#E88555] hover:underline"
            >여기</router-link
            >를 눌러주세요.
          </p>
          <p>
            회원가입은
            <router-link to="/signup" class="font-bold text-[#E88555] hover:underline">여기</router-link
            >에서 할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
