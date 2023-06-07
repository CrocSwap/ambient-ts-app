export const getLocalStorageItem = <T>(localStorageKey: string): T | null => {
    const data = localStorage.getItem(localStorageKey);
    return data ? (JSON.parse(data) as T) : null;
};
