import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  USER: '@lawstack/user',
  AUTH_TOKEN: '@lawstack/auth_token',
  REFRESH_TOKEN: '@lawstack/refresh_token',
  ONBOARDING_COMPLETE: '@lawstack/onboarding_complete',
  THEME: '@lawstack/theme',
  APP_SETTINGS: '@lawstack/app_settings',
  RECENT_SEARCHES: '@lawstack/recent_searches',
  MODEL_KEY: '@lawstack/selected-ai-model',
};

/**
 * Get a value from AsyncStorage
 * @param key The storage key
 * @returns The stored value or null if not found
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
}

/**
 * Store a value in AsyncStorage
 * @param key The storage key
 * @param value The value to store
 * @returns Promise that resolves when the operation completes
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error writing to storage:', error);
  }
}

/**
 * Remove a value from AsyncStorage
 * @param key The storage key to remove
 * @returns Promise that resolves when the operation completes
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
}

/**
 * Clear all app-specific storage
 * @returns Promise that resolves when the operation completes
 */
export async function clearStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(key => key.startsWith('@lawstack/'));
    await AsyncStorage.multiRemove(appKeys);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Get multiple values from AsyncStorage
 * @param keys Array of storage keys
 * @returns Object with key-value pairs of retrieved data
 */
export async function getMultiple(keys: string[]): Promise<Record<string, any>> {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.reduce((result, [key, value]) => {
      result[key] = value ? JSON.parse(value) : null;
      return result;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error('Error reading multiple items from storage:', error);
    return {};
  }
}

/**
 * Store multiple values in AsyncStorage
 * @param entries Array of [key, value] pairs to store
 * @returns Promise that resolves when the operation completes
 */
export async function setMultiple(entries: [string, any][]): Promise<void> {
  try {
    const pairs = entries.map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs as [string, string][]);
  } catch (error) {
    console.error('Error writing multiple items to storage:', error);
  }
}
