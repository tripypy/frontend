import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import apiClient from '@/services/api'
import type { LoginRequestDto } from '@/types/auth'

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

  // This is the key action for session persistence
  async function refreshAccessToken() {
    if (!user.value) {
      isInitialized.value = true
      return
    }

    try {
      const response = await apiClient.post('/auth/refresh')
      const { accessToken: token, expiresIn } = response.data

      // We have a new access token, but we need the user data.
      // It's already in localStorage from the a initial login.
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setAuthenticated(token, JSON.parse(storedUser), expiresIn)
      } else {
        // This case is unlikely if refresh succeeds, but handle it just in case.
        throw new Error('User data not found in localStorage after token refresh.')
      }
    } catch (error: unknown) {
      // Refresh failed (e.g., expired refresh token), ensure user is logged out.
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
    refreshAccessToken
  }
})
