import { Dispatch, SetStateAction, useState } from 'react';

export interface dexBalancePrefIF {
    isEnabled: boolean,
    enable: () => void,
    disable: () => void,
    toggle: () => void
};

export interface dexBalanceMethodsIF {
    outputTo: dexBalancePrefIF,
    drawFrom: dexBalancePrefIF
}

export const useExchangePrefs = (txType: string): dexBalanceMethodsIF => {
    const getPersistedData = (type: string) => {
        const preferences = JSON.parse(
            localStorage.getItem(`dex_balance_prefs_${txType}`) as string
        );
        let userPref: boolean|undefined;
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
        return userPref;
    };

    const [outputToDexBal, setOutputToDexBal] = useState<boolean>(
        getPersistedData('outputToDexBal') ?? false
    );
    const [drawFromDexBal, setDrawFromDexBal] = useState<boolean>(
        getPersistedData('drawFromDexBal') ?? false
    );

    class DexBalPref implements dexBalancePrefIF {
        public readonly isEnabled: boolean;
        private readonly setter: Dispatch<SetStateAction<boolean>>;
        constructor(enabled: boolean, setterFn: Dispatch<SetStateAction<boolean>>) {
            this.isEnabled = enabled;
            this.setter = setterFn;
        };
        public enable() {this.setter(true)};
        public disable() {this.setter(false)};
        public toggle() {this.setter(!this.isEnabled)};
    }

    return {
        outputTo: new DexBalPref(outputToDexBal, setOutputToDexBal),
        drawFrom: new DexBalPref(drawFromDexBal, setDrawFromDexBal)
    };
}