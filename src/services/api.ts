import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Standard Spring Boot port
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent with cross-origin requests
});

// Request interceptor for Proactive Token Refresh
apiClient.interceptors.request.use(async (config) => {
  // Pinia store must be instantiated inside the interceptor
  const authStore = useAuthStore();
  const { accessToken, accessTokenExpiresAt } = authStore;

  // 1. Do not refresh for logout requests
  if (config.url === '/auth/logout') {
    return config;
  }

  // 2. Check if token exists and is about to expire or already expired
  if (accessToken && accessTokenExpiresAt) {
    const refreshBuffer = 60 * 1000; // 60 seconds
    const isAboutToExpire = accessTokenExpiresAt < Date.now() + refreshBuffer;

    if (isAboutToExpire) {
      try {
        console.log('Access token is expired or about to expire, refreshing proactively...');
        await authStore.refreshAccessToken();
        // The header will be updated automatically by the authStore's setAuthorizationHeader
      } catch (error) {
        console.error('Failed to refresh token proactively:', error);
        // If refresh fails, the user will be logged out by the authStore.
        // The original request will likely fail with a 401, which is acceptable
        // as the user is now effectively logged out.
        return Promise.reject(error);
      }
    }
  }

  return config;
});


export default apiClient;
