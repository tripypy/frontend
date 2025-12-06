import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import apiClient from '@/services/api'
import type { LoginRequestDto, SignupRequestDto } from '@/types/auth'

export interface User {
  email: string
  nickname: string
}

export const useAuthStore = defineStore('auth', () => {
  // User info is persisted in localStorage to avoid UI flicker on page refresh.
  // Access token and its expiry are stored ONLY in memory for security.
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken = ref<string | null>(null)
  const accessTokenExpiresAt = ref<number | null>(null) // Expiration timestamp (Date.now() + expiresIn)
  const isInitialized = ref(false) // To track if initial auth check is done

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  function setAuthorizationHeader(token: string | null) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }

  // Called on successful login or refresh
  function setAuthenticated(token: string, userData: User, expiresIn: number) {
    accessToken.value = token
    accessTokenExpiresAt.value = Date.now() + expiresIn
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    setAuthorizationHeader(token)
  }

  // Called on logout or auth failure
  function clearAuthentication() {
    accessToken.value = null
    accessTokenExpiresAt.value = null
    user.value = null
    localStorage.removeItem('user')
    setAuthorizationHeader(null)
  }

  async function login(loginRequest: LoginRequestDto) {
    try {
      const response = await apiClient.post('/auth/login', loginRequest)
      const { accessToken: token, expiresIn, username, nickname } = response.data
      const userData: User = { email: username, nickname }
      setAuthenticated(token, userData, expiresIn)
      return true
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data || error.message)
      } else {
        console.error('An unexpected error occurred during login:', error)
      }
      clearAuthentication()
      return false
    }
  }

  async function logout() {
    try {
      if (accessToken.value) {
        await apiClient.post('/auth/logout')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Logout API call failed:', error.response?.data || error.message)
      } else {
        console.error('An unexpected error occurred during logout:', error)
      }
    } finally {
      // Always clear local state
      clearAuthentication()
    }
  }
  
  async function signup(signupRequest: SignupRequestDto): Promise<boolean> {
    try {
      await apiClient.post('/auth/signup', signupRequest);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // You can refine error handling here, e.g., by returning the error message
        alert(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        console.error('Signup failed:', error.response?.data || error.message);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
        console.error('An unexpected error occurred during signup:', error);
      }
      return false;
    }
  }

  async function findEmailByNickname(nickname: string): Promise<string> {
    try {
      const response = await apiClient.get(`/auth/find-email/${nickname}`);
      return response.data.email;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || '이메일 찾기 중 오류가 발생했습니다.');
      } else {
        throw new Error('알 수 없는 오류가 발생했습니다.');
      }
    }
  }

  async function resetPassword(email: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/reset-password', { email });
      return true;
    } catch (error: unknown) {
      // This endpoint fails silently on the backend, so frontend errors are less likely
      // unless there's a network issue or validation failure.
      if (axios.isAxiosError(error)) {
        console.error('Password reset failed:', error.response?.data || error.message);
      } else {
        console.error('An unexpected error occurred during password reset:', error);
      }
      return false;
    }
  }

  // This is the key action for session persistence
  async function refreshAccessToken() {
    if (!user.value) {
      isInitialized.value = true
      return
    }
    try {
      const response = await apiClient.post('/auth/refresh')
      const { accessToken: token, expiresIn } = response.data
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setAuthenticated(token, JSON.parse(storedUser), expiresIn)
      } else {
        throw new Error('User data not found in localStorage after token refresh.')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Refresh token failed:', error.response?.data || error.message)
      } else {
        console.error('An unexpected error occurred during token refresh:', error)
      }
      clearAuthentication()
    } finally {
      isInitialized.value = true
    }
  }

  return {
    user,
    accessToken,
    accessTokenExpiresAt,
    isLoggedIn,
    isInitialized,
    login,
    logout,
    signup,
    findEmailByNickname,
    resetPassword,
    refreshAccessToken
  }
})
