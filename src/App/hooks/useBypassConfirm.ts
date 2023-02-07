import { useEffect, useState } from 'react';

export const useBypassConfirm = (): [
    (item: string) => boolean,
    (item: string, pref: boolean) => void,
] => {
    // holds map of user preferences for bypassing confirmation modals by module (bool) in local state
    const [bypassConfirm, setBypassConfirm] = useState<Map<string, boolean> | undefined>();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') as string);
        console.log({ user });
        const bypassConfirmMapFromLocalStorage: Map<string, boolean> = new Map(
            JSON.parse(user.bypassConfirm),
        );
        console.log({ bypassConfirmMapFromLocalStorage });
        setBypassConfirm(bypassConfirmMapFromLocalStorage);
    }, []);

    // // hook to get persisted value from local storage and update local state
    // useEffect(() => {
    //     const getPreference = (recursiveCounter = 0): void => {
    //         try {
    //             const persistedValue = JSON.parse(
    //                 localStorage.getItem('user') as string,
    //             ).bypassConfirm;
    //             console.log({persistedValue})
    //             const new new Map(persistedValue)
    //             console.log({})
    //             persistedValue && setBypassConfirm();
    //         } catch (err) {
    //             console.warn(err);
    //             if (recursiveCounter < 50)
    //                 setTimeout(() => getPreference(recursiveCounter + 1), 200);
    //         }
    //     };
    //     setTimeout(getPreference, 100);
    // }, []);

    const checkBypassConfirm = (item: string): boolean => {
        if (bypassConfirm === null) {
            return false;
        } else {
            // console.log(bypassConfirm);
            const val = bypassConfirm?.get(item) ?? false;
            const output = bypassConfirm ? val : false;
            return bypassConfirm ? output : false;
        }
    };

    const updateBypassConfirm = (item: string, pref: boolean): void => {
        if (bypassConfirm) {
            const stateCopy = bypassConfirm;
            stateCopy?.set(item, pref);
            setBypassConfirm(stateCopy);
            const user = JSON.parse(localStorage.getItem('user') as string);
            user.bypassConfirm = JSON.stringify(Array.from(stateCopy));
            localStorage.setItem('user', JSON.stringify(user));
        }
    };

    return [checkBypassConfirm, updateBypassConfirm];
};
