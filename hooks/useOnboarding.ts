import { useState, useEffect, useCallback } from 'react';
import { isOnboardingComplete, setOnboardingComplete } from '../lib/settings-storage';

/**
 * Custom hook for onboarding status management
 */
export const useOnboarding = () => {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const completed = await isOnboardingComplete();
        setHasCompleted(completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = useCallback(async () => {
    try {
      await setOnboardingComplete(true);
      setHasCompleted(true);
      return true;
    } catch (error) {
      console.error('Error marking onboarding as complete:', error);
      return false;
    }
  }, []);

  // Reset onboarding status (for development/testing)
  const resetOnboarding = useCallback(async () => {
    try {
      await setOnboardingComplete(false);
      setHasCompleted(false);
      return true;
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
      return false;
    }
  }, []);

  return {
    hasCompleted,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
};
