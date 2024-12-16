import { useMemo, useState } from 'react';

export interface directSwapsOnlyIF {
    isEnabled: boolean;
    setValue: (newVal: boolean) => void;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

export const useDirectSwapsOnly = (): directSwapsOnlyIF => {
    const localStorageKey = 'direct_swaps_only';

    const checkPref = (): boolean | undefined => {
        const output: boolean =
            JSON.parse(localStorage.getItem(localStorageKey) as string) ||
            false;
        return output;
    };

    const [pref, setPref] = useState<boolean>(checkPref() ?? false);

    const updatePref = (newVal: boolean): void => {
        localStorage.setItem(localStorageKey, JSON.stringify(newVal));
        setPref(newVal);
    };

    return useMemo(
        () => ({
            isEnabled: pref,
            setValue: updatePref,
            enable: () => updatePref(true),
            disable: () => updatePref(false),
            toggle: () => updatePref(!pref),
        }),
        [pref],
    );
};
