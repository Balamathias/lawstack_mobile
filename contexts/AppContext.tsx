import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useOnboarding } from '../hooks/useOnboarding';
import { User } from '../lib/auth-storage';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; username: string; first_name?: string; last_name?: string; phone_number?: string }) => Promise<{ success: boolean; error?: string }>;
  themeMode: 'light' | 'dark' | 'system';
  isDark: boolean;
  changeTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  hasCompletedOnboarding: boolean | null;
  completeOnboarding: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { themeMode, isDark, changeTheme } = useTheme();
  const { hasCompleted: hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  const value = {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    
    // Theme
    themeMode,
    isDark,
    changeTheme,
    
    // Onboarding
    hasCompletedOnboarding,
    completeOnboarding,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
