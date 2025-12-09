import apiClient from './api';
import type { User } from '@/stores/auth'; // Assuming User interface is exported from auth.ts

export const fetchUserProfile = async (userId: number): Promise<User | null> => {
  try {
    const response = await apiClient.get<User>(`/user/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch profile for user ${userId}:`, error);
    return null;
  }
};

export const fetchFriends = async (userId: number): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>(`/user/${userId}/friends`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch friends list for user ${userId}:`, error);
    return [];
  }
};
