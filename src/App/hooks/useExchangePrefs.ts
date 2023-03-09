import { useState } from 'react';

export const useExchangePrefs = (txType: string) => {
    console.log('exchange balance pref for txType: ' + txType);

    const [outputToDexBal, setOutputToDexBal] = useState<boolean>(false);
    const [drawFromDexBal, setDrawFromDexBal] = useState<boolean>(false);
    false && outputToDexBal;
    false && setOutputToDexBal;
    false && drawFromDexBal;
    false && setDrawFromDexBal;
}