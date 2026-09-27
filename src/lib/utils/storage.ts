export interface StorageItem<T> {
  value: T;
  expiresAt?: number;
}

/**
 * Save an item to localStorage with optional SSR safety and TTL.
 */
export function setItem<T>(key: string, value: T, ttlSeconds?: number): void {
  if (typeof window === "undefined") return;
  const item: StorageItem<T> = { value };
  if (ttlSeconds !== undefined) {
    item.expiresAt = Date.now() + ttlSeconds * 1000;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error setting item in localStorage:", error);
  }
}

/**
 * Retrieve an item from localStorage. Automatically cleans up if expired.
 * SSR safe.
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr) as StorageItem<T>;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error("Error getting item from localStorage:", error);
    return null;
  }
}

/**
 * Remove an item from localStorage.
 */
export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing item from localStorage:", error);
  }
}

/**
 * Clear all items from localStorage.
 */
export function clear(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
