import { useState, useEffect, useCallback } from 'react';
import { 
  getUser, 
  getAuthTokens, 
  storeSession, 
  clearAuth, 
  isAuthenticated, 
  User, 
  AuthTokens, 
  storeUser,
  storeAuthTokens
} from '../lib/auth-storage';
import { router } from 'expo-router';
import { stackbase } from '../lib/stackbase';
import { API_URL } from '@/constants/Endpoints';
import { useUser } from '@/services/hooks/auth';
import { STORAGE_KEYS } from '@/lib/async-storage';

import { getUser as _getUser } from '@/services/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom hook for authentication functionality
 */
export const useAuth = () => {

  const { data: user, isPending } = useUser();
  const currentUser = user?.data;

  const [state, setState] = useState<AuthState>({
    user: currentUser || null,
    isLoading: isPending,
    isAuthenticated: !!currentUser,
  });

  // Load the authentication state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const isLoggedIn = await isAuthenticated();
        if (isLoggedIn && currentUser) {
          await storeUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    loadAuthState();
  }, []);

  // Login function - updated to use stackbase
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Use stackbase to make the actual API call
      const response = await stackbase.post('/auth/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };

      await storeAuthTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

      // Store the session data
      const { data: user } = await _getUser()

      if (user) {
        await storeUser(user);
      }

      
      // Update the state
      setState({
        user: user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to login' 
      };
    }
  }, []);

  // Register function - updated to use stackbase
  const register = useCallback(async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Use stackbase to make the actual API call
      const response = await stackbase.post('/auth/register/', {
        email: data.email,
        password: data.password,
        username: data.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || ''
      });
      
      const userData = response.data.data;
      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
      
      // Store the session data
      await storeSession(userData, tokens);
      
      // Update the state
      setState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to register' 
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await clearAuth();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Update user profile - updated to use stackbase
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Use stackbase to make the API call
      const response = await stackbase.patch('/auth/profile/', userData);
      
      const updatedUser = response.data.data;
      
      // Get current tokens
      const tokens = await getAuthTokens();
      if (!tokens) {
        throw new Error('No authentication tokens found');
      }
      
      // Store updated user
      await storeSession(updatedUser, tokens);
      
      setState({
        user: updatedUser,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    register,
    updateProfile,
  };
};
