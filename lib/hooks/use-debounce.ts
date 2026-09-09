import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value by a specified delay in milliseconds.
 * Provides smooth, lag-free user input while minimizing expensive API calls or filter updates.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
