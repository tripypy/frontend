import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import apiClient from '@/services/api'
import type { LoginRequestDto, SignupRequestDto } from '@/types/auth'

// This represents the full user profile object, including optional fields
// This is what we store in `user.value` and localStorage
export interface User {
  id: number;
  email?: string;
  nickname: string;
  profileImageUrl: string | null;
  bio?: string;
  friendsCount: number;
}

// This represents the minimal data received from the /login endpoint
interface LoggedInUser {
    id: number;
    nickname: string;
    email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken = ref<string | null>(null)
  const isInitialized = ref(false)

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  function setAuthorizationHeader(token: string | null) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }

  function setAuthenticated(token: string, userData: User) {
    accessToken.value = token
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    setAuthorizationHeader(token)
  }

  function clearAuthentication() {
    accessToken.value = null
    user.value = null
    localStorage.removeItem('user')
    setAuthorizationHeader(null)
  }

  async function fetchUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/user/me');
      return response.data;
    } catch(error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  }

  async function login(loginRequest: LoginRequestDto): Promise<boolean> {
    try {
      // 1. Login to get the access token
      const loginResponse = await apiClient.post('/auth/login', loginRequest)
      const token = loginResponse.data.accessToken

      // 2. Set token immediately for subsequent requests
      setAuthorizationHeader(token);

      // 3. Fetch the complete user profile
      const fetchedUser = await fetchUser();

      if (fetchedUser) {
        // 4. Set the full authenticated state
        setAuthenticated(token, fetchedUser);
        return true;
      } else {
        throw new Error("Failed to fetch user profile after login.");
      }
    } catch (error) {
      console.error('Login process failed:', error)
      clearAuthentication()
      return false
    }
  }

  async function logout() {
    try {
      if (accessToken.value) {
        await apiClient.post('/auth/logout')
      }
    } catch (error) {
        console.error('An unexpected error occurred during logout:', error)
    } finally {
      clearAuthentication()
    }
  }
  
  async function signup(signupRequest: SignupRequestDto): Promise<boolean> {
    try {
      await apiClient.post('/auth/signup', signupRequest);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data?.message || '회원가입 중 오류가 발생했습니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
      return false;
    }
  }

  async function findEmailByNickname(nickname: string): Promise<string> {
    try {
      const response = await apiClient.get<{ email: string }>(`/auth/find-email/${nickname}`);
      return response.data.email;
    } catch (error: any) {
      console.error('이메일 찾기 실패:', error);
      throw new Error(error.response?.data?.message || '이메일 찾기 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  async function resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 실패:', error);
      throw new Error(error.response?.data?.message || '비밀번호 재설정 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  async function updateUserProfile(data: { nickname?: string; bio?: string }): Promise<boolean> {
    try {
      await apiClient.patch('/user/me', data);
      await fetchUserAndUpdateStore(); // Custom helper to just update the store
      return true;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
      return false;
    }
  }

  async function fetchUserAndUpdateStore() {
      const updatedUser = await fetchUser();
      if(updatedUser) {
          user.value = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
      }
  }

  async function uploadProfileImage(imageFile: File): Promise<boolean> {
    if (!user.value) return false;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      await apiClient.post(`/user/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchUserAndUpdateStore();
      return true;
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      alert('프로필 이미지 업로드에 실패했습니다.');
      return false;
    }
  }

  async function deleteProfileImage(): Promise<boolean> {
    if (!user.value) return false;
    try {
      await apiClient.delete(`/user/profile-image`);
      await fetchUserAndUpdateStore();
      return true;
    } catch (error) {
      console.error('프로필 이미지 삭제 실패:', error);
      alert('프로필 이미지 삭제에 실패했습니다.');
      return false;
    }
  }

  async function refreshAccessToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      const token = response.data.accessToken;
      setAuthorizationHeader(token);
      
      const fetchedUser = await fetchUser();
      if (fetchedUser) {
        setAuthenticated(token, fetchedUser);
      } else {
        throw new Error('Failed to fetch user data during token refresh.');
      }
    } catch (error) {
      console.error('Token refresh failed, logging out.', error);
      clearAuthentication();
    } finally {
      isInitialized.value = true;
    }
  }

  return {
    user,
    accessToken,
    isLoggedIn,
    isInitialized,
    login,
    logout,
    signup,
    findEmailByNickname,
    resetPassword,
    updateUserProfile,
    uploadProfileImage,
    deleteProfileImage,
    refreshAccessToken
  }
})