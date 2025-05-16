import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem } from '../lib/async-storage';

/**
 * Generic hook for async storage operations
 * @param key The storage key
 * @param initialValue The initial value
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the value from storage on mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        const value = await getItem<T>(key);
        setStoredValue(value !== null ? value : initialValue);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load value from storage'));
        console.error(`Error loading ${key} from storage:`, e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key, initialValue]);

  // Function to update the value in storage
  const setValue = useCallback(async (value: T | ((prev: T) => T)) => {
    try {
      setIsLoading(true);
      
      // Allow functional updates
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // Save to storage
      await setItem(key, newValue);
      
      // Update state
      setStoredValue(newValue);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to save value to storage'));
      console.error(`Error saving ${key} to storage:`, e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [key, storedValue]);

  // Function to remove the value from storage
  const removeValue = useCallback(async () => {
    try {
      setIsLoading(true);
      await removeItem(key);
      setStoredValue(initialValue);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove value from storage'));
      console.error(`Error removing ${key} from storage:`, e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  return { 
    value: storedValue, 
    setValue, 
    removeValue, 
    isLoading, 
    error 
  };
}
