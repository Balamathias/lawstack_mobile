/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Emerald theme colors
const tintColorLight = '#10B981'; // Emerald-500
const tintColorDark = '#34D399'; // Emerald-400

export const Colors = {
  light: {
    primary: tintColorLight,
    primaryDark: '#059669', // Emerald-600
    primaryLight: '#ECFDF5', // Emerald-50
    background: '#FFFFFF',
    secondaryBackground: '#F9FAFB',
    text: '#111827',
    secondaryText: '#6B7280',
    border: '#E5E7EB',
    focusedBorder: tintColorLight,
    focusedBackground: '#ECFDF5',
    error: '#EF4444',
    card: '#FFFFFF',
    shadow: '#10B981',
    tabBarBackground: '#FFFFFF',
    tabBarIconDefault: '#6B7280',
    tabBarIconSelected: tintColorLight,
  },
  dark: {
    primary: tintColorDark,
    primaryDark: '#10B981', // Emerald-500
    primaryLight: '#064E3B', // Emerald-900
    background: '#111',
    secondaryBackground: '#212121',
    text: '#F3F4F6',
    secondaryText: '#9CA3AF',
    border: '#121212',
    focusedBorder: tintColorDark,
    focusedBackground: '#064E3B',
    error: '#EF4444',
    card: '#222',
    shadow: '#000000',
    tabBarBackground: '#1F2937',
    tabBarIconDefault: '#9CA3AF',
    tabBarIconSelected: tintColorDark,
  },
};
