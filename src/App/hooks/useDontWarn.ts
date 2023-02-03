import { useEffect, useState, Dispatch, SetStateAction } from 'react';

export const useDontWarn = (): [
    boolean,
    Dispatch<SetStateAction<boolean>>
] => {
    // hold user preference (bool) in local state
    const [dontWarn, setDontWarn] = useState<boolean>(false);

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

    // hook to append new value to local storage when user updates preference manually
    useEffect(() => {
        const {user} = JSON.parse(localStorage.getItem('user') as string);
        if (user.dontWarn !== dontWarn) {
            user.dontWarn = dontWarn;
            localStorage.set(JSON.stringify(user));
        }
    }, [dontWarn]);

    return [dontWarn, setDontWarn];
}