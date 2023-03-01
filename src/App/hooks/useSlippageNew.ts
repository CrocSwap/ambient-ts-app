import { useState } from 'react';

export interface SlippageNewIF {
    stable: number,
    volatile: number
}

export const useSlippageNew = (
    slippageType: string,
    defaults: SlippageNewIF
): void => {

    const getSlippage = () => {
        const pair = JSON.parse(localStorage.getItem(`slippage_${slippageType}`) as string);
        return pair ?? defaults;
    }

    const [slippage, setSlippage] = useState(getSlippage());
    false && slippage;
    false && setSlippage;
}