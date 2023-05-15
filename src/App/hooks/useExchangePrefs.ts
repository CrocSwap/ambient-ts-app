import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

// interface for one object with a value and reducers to update said value
export interface dexBalancePrefIF {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

// interface for an object with two nested objects to manage draw vs receive prefs
// this is the interface of this hook's returned value
export interface dexBalanceMethodsIF {
    outputToDexBal: dexBalancePrefIF;
    drawFromDexBal: dexBalancePrefIF;
}

// interface for an object with multiple instances of this hook inside it
// this is how we pass data from App.tsx through props to the rest of the app
export interface allDexBalanceMethodsIF {
    swap: dexBalanceMethodsIF;
    limit: dexBalanceMethodsIF;
    range: dexBalanceMethodsIF;
}

export const useExchangePrefs = (txType: string): dexBalanceMethodsIF => {
    // unique key for each instance of this hook to label data in local storage
    const localStorageSlug: string = 'dex_bal_pref_' + txType;

    // fn to retrieve persisted data from local storage to initialization
    // may return `undefined` but that value is handled downstream
    const getPersistedData = (type: string): boolean | undefined => {
        // get correct key-val pair from local storage and parse as string
        const preferences = JSON.parse(
            localStorage.getItem(localStorageSlug) as string,
        );
        // declare an output variable (`undefined` if no persisted value)
        let userPref: boolean | undefined;
        // switch statement to get the correct persisted value from data
        // returns `undefined` is data does not exist or if arg `type` is unrecongized
        switch (type) {
            case 'outputToDexBal':
                userPref = preferences?.outputToDexBal;
                break;
            case 'drawFromDexBal':
                userPref = preferences?.drawFromDexBal;
                break;
            default:
                userPref = undefined;
        }
        // return persisted data if found (or `undefined` if not)
        return userPref;
    };

    // hooks to track in-session user preference
    // initialize from local storage if persisted value was found
    const [outputToDexBal, setOutputToDexBal] = useState<boolean>(
        getPersistedData('outputToDexBal') ?? false,
    );
    const [drawFromDexBal, setDrawFromDexBal] = useState<boolean>(
        getPersistedData('drawFromDexBal') ?? false,
    );

    // hook to update local storage when either persisted value changes
    useEffect(() => {
        localStorage.setItem(
            localStorageSlug,
            JSON.stringify({ outputToDexBal, drawFromDexBal }),
        );
    }, [outputToDexBal, drawFromDexBal]);

    // class constructor to manage each data on preference (draw vs receive)
    // contains the raw value + update functions
    // objects returned by constructor are checked against the proper interface
    class DexBalPref implements dexBalancePrefIF {
        public readonly isEnabled: boolean;
        public readonly enable: () => void;
        public readonly disable: () => void;
        public readonly toggle: () => void;
        constructor(
            enabled: boolean,
            setterFn: Dispatch<SetStateAction<boolean>>,
        ) {
            this.isEnabled = enabled;
            this.enable = () => setterFn(true);
            this.disable = () => setterFn(false);
            this.toggle = () => setterFn(!this.isEnabled);
        }
    }

    // return objects to retrieve and update user preferences
    return useMemo(
        () => ({
            outputToDexBal: new DexBalPref(outputToDexBal, setOutputToDexBal),
            drawFromDexBal: new DexBalPref(drawFromDexBal, setDrawFromDexBal),
        }),
        [outputToDexBal, drawFromDexBal],
    );
};
