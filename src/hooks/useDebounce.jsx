import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param {any} value The value to debounce (e.g., a search query).
 * @param {number} delay The delay in milliseconds (e.g., 500).
 * @returns {any} The debounced value.
 */
export const useDebounce = (value, delay) => {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value or delay changes
        // This prevents the old timer from firing
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run the effect if value or delay changes

    return debouncedValue;
};