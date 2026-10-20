"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook for syncing state with localStorage.
 * 
 * - Handles SSR: returns initial value on server, syncs on client mount
 * - JSON serialization: automatically serializes/deserializes values
 * - Cross-tab sync: listens to storage events from other tabs
 * - Cleanup: removes listener on unmount
 * 
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  // Return wrapped setter to handle both direct values and functions
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`useLocalStorage error for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`useLocalStorage hydration error for key "${key}":`, error);
    }

    setIsMounted(true);
  }, [key]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`useLocalStorage sync error for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, isMounted]);

  return [storedValue, setValue];
}
