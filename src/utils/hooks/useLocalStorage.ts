import { useEffect, useState } from 'react';

// two inputs: (1) storage key and (2) fallback value
export const useLocalStorage = (storageKey: string, fallbackState: string) => {
    // local state initializes with value from local storage
    // uses key provided in first argument for local storage
    // if no value in local storage, initializes with fallback state
    // fallback state is never written to local storage
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem(storageKey) as string) ?? fallbackState,
    );

    // whenever useState receives a new value, write it to local storage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    // return value and setter function to the parent component
    return [value, setValue];
};
