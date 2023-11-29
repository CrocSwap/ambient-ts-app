export const getLocalStorageItem = <T>(localStorageKey: string): T | null => {
    const data = localStorage.getItem(localStorageKey);
    if (typeof data === 'string') {
        return data as T;
    } else {
        return data ? (JSON.parse(data) as T) : null;
    }
};
