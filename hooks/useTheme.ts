import { useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import { getThemeSetting, setThemeSetting } from '../lib/settings-storage';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Custom hook for theme management
 */
export const useTheme = () => {
  const deviceColorScheme = useDeviceColorScheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme setting from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getThemeSetting();
        setThemeMode(savedTheme);
        
        // Apply the theme
        if (savedTheme === 'system') {
          setColorScheme(deviceColorScheme as any);
        } else {
          setColorScheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [deviceColorScheme, setColorScheme]);

  // Update theme when device color scheme changes if using system
  useEffect(() => {
    if (themeMode === 'system' && deviceColorScheme) {
      setColorScheme(deviceColorScheme as any);
    }
  }, [deviceColorScheme, themeMode, setColorScheme]);

  // Function to change the theme
  const changeTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeMode(newTheme);
      await setThemeSetting(newTheme);
      
      if (newTheme === 'system') {
        setColorScheme(deviceColorScheme as any);
      } else {
        setColorScheme(newTheme);
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  return {
    themeMode,
    colorScheme,
    isLoading,
    isDark: colorScheme === 'dark',
    changeTheme,
    toggleTheme: () => changeTheme(colorScheme === 'dark' ? 'light' : 'dark'),
  };
};
