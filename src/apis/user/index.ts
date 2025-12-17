import apiClient from '@/apis/http';
import type { UserMeResponseDto, UserProfileResponseDto, UserFriendsResponseDto } from '@/apis/user/types'

/**
 * 특정 사용자의 프로필을 조회합니다.
 */
export const fetchUserProfile = async (userId: number): Promise<UserProfileResponseDto
 | null> => {
    try {
      const response = await apiClient.get<UserProfileResponseDto>(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
      return null;
    }
};

/**
 * 특정 사용자의 친구 목록을 조회합니다.
 */
export const fetchFriends = async (userId: number): Promise<UserFriendsResponseDto> => {
    try {
        const response = await apiClient.get<UserFriendsResponseDto>(`/users/${userId}/friends`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch friends list for user ${userId}:`, error);
        return [];
    }
};

/**
 * 현재 로그인된 사용자의 상세 정보를 조회합니다.
 */
export const requestFetchUser = async (): Promise<UserMeResponseDto> => {
  const response = await apiClient.get<UserMeResponseDto>('/users/me');
  return response.data;
};

/**
* 프로필 정보 수정 API 요청
*/
export const requestUpdateUserProfile = async (data: { nickname?: string; bio?: string }): Promise<void> => {
  await apiClient.patch('/users/me', data);
};

/**
* 프로필 이미지 업로드 API 요청
*/
export const requestUploadProfileImage = async (imageFile: File): Promise<void> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  await apiClient.post(`/users/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
* 프로필 이미지 삭제 API 요청
*/
export const requestDeleteProfileImage = async (): Promise<void> => {
  await apiClient.delete(`/users/profile-image`);
};