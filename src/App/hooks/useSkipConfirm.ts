import { useState } from 'react';

export interface skipConfirmIF {
    moduleFor: string;
    isEnabled: boolean;
    setValue: (newVal: boolean) => void;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

export interface allSkipConfirmMethodsIF {
    swap: skipConfirmIF;
    limit: skipConfirmIF;
    range: skipConfirmIF;
    repo: skipConfirmIF;
}

export const useSkipConfirm = (module: string): skipConfirmIF => {
    const localStorageKey = 'skip_confirmation';

    const getMapFromLocalStorage = (): Map<string, boolean> =>
        new Map(JSON.parse(localStorage.getItem(localStorageKey) as string));

    const checkPref = (): boolean | undefined => {
        const prefs: Map<string, boolean> = getMapFromLocalStorage();
        const output: boolean | undefined = prefs.get(module);
        return output;
    };

    const [pref, setPref] = useState<boolean>(checkPref() ?? false);

    const updatePref = (newVal: boolean): void => {
        const prefs: Map<string, boolean> = getMapFromLocalStorage();
        prefs.set(module, newVal);
        localStorage.setItem(
            localStorageKey,
            JSON.stringify(Array.from(prefs)),
        );
        setPref(newVal);
    };

    return {
        moduleFor: module,
        isEnabled: pref,
        setValue: (newVal: boolean) => updatePref(newVal),
        enable: () => updatePref(true),
        disable: () => updatePref(false),
        toggle: () => updatePref(!pref),
    };
};
