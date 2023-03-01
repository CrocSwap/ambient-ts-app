import { useMemo, useState } from 'react';

export interface SlippageNewIF {
    stable: number,
    volatile: number
}

export interface SlippageMethodsIF {
    stable: number;
    volatile: number;
}

export const useSlippageNew = (
    slippageType: string,
    defaults: SlippageNewIF
): SlippageMethodsIF => {
    const getSlippage = () => {
        const pair = JSON.parse(localStorage.getItem(`slippage_${slippageType}`) as string);
        return pair ?? defaults;
    }

    const [slippage, setSlippage] = useState<SlippageNewIF>(getSlippage());

    const stable = useMemo<number>(() => slippage.stable, [slippage]);
    const volatile = useMemo<number>(() => slippage.volatile, [slippage]);

    false && setSlippage;

    return {
        stable,
        volatile
    };
}