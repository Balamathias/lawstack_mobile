import { getItem, setItem, STORAGE_KEYS } from './async-storage';

/**
 * App settings interface
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  useBiometrics: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: true,
  useBiometrics: false,
  fontSize: 'medium',
};

/**
 * Gets app settings, falling back to defaults for any missing properties
 * @returns The complete app settings
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  const settings = await getItem<Partial<AppSettings>>(STORAGE_KEYS.APP_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
};

/**
 * Updates app settings by merging with existing settings
 * @param newSettings Partial settings to update
 * @returns The updated settings
 */
export const updateAppSettings = async (
  newSettings: Partial<AppSettings>
): Promise<AppSettings> => {
  const currentSettings = await getAppSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  await setItem(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
  return updatedSettings;
};

/**
 * Gets the current theme setting
 * @returns The theme name ('light', 'dark', or 'system')
 */
export const getThemeSetting = async (): Promise<'light' | 'dark' | 'system'> => {
  const settings = await getAppSettings();
  return settings.theme;
};

/**
 * Sets the theme setting
 * @param theme The theme to set
 */
export const setThemeSetting = async (
  theme: 'light' | 'dark' | 'system'
): Promise<void> => {
  await updateAppSettings({ theme });
};

/**
 * Sets onboarding completion status
 */
export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
  await setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete);
};

/**
 * Checks if onboarding has been completed
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  const result = await getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return result === true;
};
