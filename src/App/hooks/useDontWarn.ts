import { useEffect, useState, Dispatch, SetStateAction } from 'react';

export const useDontWarn = (): [
    boolean,
    Dispatch<SetStateAction<boolean>>
] => {
    const [dontWarn, setDontWarn] = useState<boolean>(false);

    useEffect(() => {
        const getPreference = (recursiveCounter=0): void => {
            try {
                const persistedValue = JSON.parse(localStorage.getItem('user') as string).dontWarn;
                setDontWarn(persistedValue);
            } catch (err) {
                console.warn(err);
                if (recursiveCounter < 50)
                    setTimeout(() => getPreference(recursiveCounter+1), 200);
                else {
                    ;
                }
            }
        };
        getPreference();
    }, []);

    useEffect(() => {
        const {user} = JSON.parse(localStorage.getItem('user') as string);
        user.dontWarn = dontWarn;
        localStorage.set(JSON.stringify(user));
    }, [dontWarn]);

    return [dontWarn, setDontWarn];
}