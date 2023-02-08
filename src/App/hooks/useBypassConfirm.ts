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

    const checkBypassConfirm = (item: string): boolean => {
        const val = bypassConfirm?.get(item) ?? false;
        const output = bypassConfirm ? val : false;
        return bypassConfirm ? output : false;
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
