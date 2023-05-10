import { useMemo, useState } from 'react';

// return interface for each instance of this hook
export interface skipConfirmIF {
    moduleFor: string;
    isEnabled: boolean;
    setValue: (newVal: boolean) => void;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

// interface for all data from each instance of this hook
export interface allSkipConfirmMethodsIF {
    swap: skipConfirmIF;
    limit: skipConfirmIF;
    range: skipConfirmIF;
    repo: skipConfirmIF;
}

// custom hook to track and persist user preference for bypassing the confirm
// ... transanction modal, each instance of this hook tracks a single value
// ... but all persist data in the same local storage data object
export const useSkipConfirm = (module: string): skipConfirmIF => {
    // key for local storage to access or persist data
    const localStorageKey = 'skip_confirmation';

    // fn to get local storage data and build a Map
    const getMapFromLocalStorage = (): Map<string, boolean> =>
        new Map(JSON.parse(localStorage.getItem(localStorageKey) as string));

    // fn to check a given value in the preferences Map
    const checkPref = (): boolean | undefined => {
        const prefs: Map<string, boolean> = getMapFromLocalStorage();
        const output: boolean | undefined = prefs.get(module);
        return output;
    };

    // track user pref for value specific to each instance of this hook
    const [pref, setPref] = useState<boolean>(checkPref() ?? false);

    // fn to update tracked value and local storage in parallel
    const updatePref = (newVal: boolean): void => {
        // get a fresh copy of data Map from local storage
        // this matters in case a separate instance has updated local storage
        const prefs: Map<string, boolean> = getMapFromLocalStorage();
        // update the relevant data in the Map
        prefs.set(module, newVal);
        // persist the updated Map with new data in local storage
        localStorage.setItem(
            localStorageKey,
            JSON.stringify(Array.from(prefs)),
        );
        // update local state with the new value
        setPref(newVal);
    };

    // moduleFor ➔ which value is being reference, mainly for debugging
    // isEnabled ➔ the current persisted value held in local state
    // setValue ➔ fn accepting a dynamic boolean value
    // enable ➔ fn pre-loaded to persist `true` boolean value
    // disable ➔ fn pre-loaded to persist `false` boolean value
    // toggle ➔ fn pre-loaded to reverse the current persisted value
    return useMemo(
        () => ({
            moduleFor: module,
            isEnabled: pref,
            setValue: updatePref,
            enable: () => updatePref(true),
            disable: () => updatePref(false),
            toggle: () => updatePref(!pref),
        }),
        [module, pref],
    );
};
