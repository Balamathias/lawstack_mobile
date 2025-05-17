const AIModelMap = {
  default: 'gemini-1.5-pro',
  advanced: 'gemini-2.0-flash',
  expert: 'gemini-2.5-flash-preview-04-17',
} as const;

type AIModelKey = keyof typeof AIModelMap;

export const AIModels = {
  ...AIModelMap,
  getModel: (model: AIModelKey) => AIModelMap[model] || AIModelMap.default,
  allModels: () => Object.keys(AIModelMap) as AIModelKey[],
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0, // Optional: remove decimals if not needed
        maximumFractionDigits: 0, // Optional: remove decimals if not needed
    }).format(amount);
};

export const PAGE_SIZE = 30; // Default page size for pagination
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100]; // Options for page size selection

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the provided function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}