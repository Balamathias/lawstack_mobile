import axios from 'axios';
import { getAuthTokens, storeAuthTokens, clearAuth } from './auth-storage';
import { API_URL } from '@/constants/Endpoints';

/**
 * Create an axios instance with predefined configuration
 */
const stackbase = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor to automatically add auth token
stackbase.interceptors.request.use(
    async (config) => {
        const tokens = await getAuthTokens();
        
        if (tokens?.accessToken) {
            config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
        
        // Special handling for specific endpoints if needed
        if (config.url?.includes('/quizzes/')) {
            console.log("Quiz API request:", config.method, config.url);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
stackbase.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors by attempting token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite retry loop
            originalRequest._retry = true;
            
            const tokens = await getAuthTokens();
            
            if (!tokens?.refreshToken) {
                // No refresh token available, user needs to login again
                await clearAuth();
                return Promise.reject(error);
            }
            
            try {
                // Attempt to refresh the token
                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: tokens.refreshToken,
                });
                
                const newAccessToken = response.data.access;
                const newRefreshToken = response.data.refresh || tokens.refreshToken;
                
                // Store the new tokens
                await storeAuthTokens({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });
                
                // Retry the original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return stackbase(originalRequest);
            } catch (refreshError) {
                // Token refresh failed, clear auth data
                await clearAuth();
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export { stackbase };