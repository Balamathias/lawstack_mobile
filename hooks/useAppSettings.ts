import { useState, useEffect, useCallback } from 'react';
import { AppSettings, getAppSettings, updateAppSettings, DEFAULT_SETTINGS } from '../lib/settings-storage';

/**
 * Custom hook for app settings management
 */
export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getAppSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = await updateAppSettings(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }, []);

  // Toggle a boolean setting
  const toggleSetting = useCallback(async (key: keyof AppSettings) => {
    if (typeof settings[key] === 'boolean') {
      return await updateSettings({ [key]: !settings[key] } as any);
    }
    return false;
  }, [settings, updateSettings]);

  // Change font size
  const changeFontSize = useCallback(async (size: 'small' | 'medium' | 'large') => {
    return await updateSettings({ fontSize: size });
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    toggleSetting,
    changeFontSize,
  };
};
