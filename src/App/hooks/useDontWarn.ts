import { useEffect, useState } from 'react';

export const useDontWarn = (): [
    (item: string) => boolean,
    (item: string, pref: boolean) => void
] => {
    // hold user preference (bool) in local state
    const [dontWarn, setDontWarn] = useState<Map<string, boolean>|null>(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') as string);
        setDontWarn(new Map(JSON.parse(user.dontWarn)));
    }, []);

    // hook to get persisted value from local storage and update local state
    useEffect(() => {
        const getPreference = (recursiveCounter=0): void => {
            try {
                const persistedValue = JSON.parse(localStorage.getItem('user') as string).dontWarn;
                setDontWarn(persistedValue);
            } catch (err) {
                console.warn(err);
                if (recursiveCounter < 50)
                    setTimeout(() => getPreference(recursiveCounter+1), 200);
                }
            }
        getPreference();
    }, []);

    const checkDontWarn = (
        item: string
    ): boolean => dontWarn?.get(item) ?? false;

    const updateDontWarn = (
        item: string,
        pref: boolean
    ): void => {
        dontWarn?.set(item, pref);
    };

    return [
        checkDontWarn,
        updateDontWarn
    ];
}