import { getItem, setItem, removeItem, STORAGE_KEYS } from './async-storage';
import { User as DBUser } from '@/@types/db';

/**
 * User type definition
 */
export interface User extends DBUser {};

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Stores the user data in AsyncStorage
 * @param user The user object to store
 */
export const storeUser = async (user: User): Promise<void> => {
  await setItem(STORAGE_KEYS.USER, user);
};

/**
 * Retrieves the stored user data
 * @returns The user object or null if not found
 */
export const getUser = async (): Promise<User | null> => {
  return await getItem<User>(STORAGE_KEYS.USER);
};

/**
 * Stores authentication tokens
 * @param tokens The authentication tokens to store
 */
export const storeAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  await setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  await setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
};

/**
 * Gets the stored authentication tokens
 * @returns The authentication tokens or null if not found
 */
export const getAuthTokens = async (): Promise<AuthTokens | null> => {
  const accessToken = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const refreshToken = await getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  return { accessToken, refreshToken };
};

/**
 * Stores a complete user session (user data + tokens)
 * @param user The user data
 * @param tokens The authentication tokens
 */
export const storeSession = async (user: User, tokens: AuthTokens): Promise<void> => {
  await storeUser(user);
  await storeAuthTokens(tokens);
};

/**
 * Clears all authentication data
 */
export const clearAuth = async (): Promise<void> => {
  await removeItem(STORAGE_KEYS.USER);
  await removeItem(STORAGE_KEYS.AUTH_TOKEN);
  await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Checks if the user is logged in by looking for an access token
 * @returns True if the user has a stored access token
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  return !!token;
};
