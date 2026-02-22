"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` milliseconds of no changes.
 *
 * Usage:
 *   const debouncedEmail = useDebounce(email, 300);
 *   // validate debouncedEmail in a useEffect
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
