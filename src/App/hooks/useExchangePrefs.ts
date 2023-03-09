import { useState } from 'react';

export const useExchangePrefs = (txType: string) => {
    console.log('exchange balance pref for txType: ' + txType);

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

    return {
        outputToDexBal: {
            value: outputToDexBal,
            enable: () => setOutputToDexBal(true),
            disable: () => setOutputToDexBal(false),
            toggle: () => setOutputToDexBal(!outputToDexBal)
        },
        drawFromDexBal: {
            value: drawFromDexBal,
            enable: () => setDrawFromDexBal(true),
            disable: () => setDrawFromDexBal(false),
            toggle: () => setDrawFromDexBal(!drawFromDexBal)
        }
    };
}