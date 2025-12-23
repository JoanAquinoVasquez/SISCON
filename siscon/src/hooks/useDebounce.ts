import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos (default: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
