import { useMemo, useState } from 'react';

export interface SlippageNewIF {
    stable: number,
    volatile: number
}

export interface SlippageMethodsIF {
    stable: number;
    volatile: number;
    updateStable: (val: number) => void;
    updateVolatile: (val: number) => void;
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

    const updateSlippage = (slipType: string, newVal: number) => {
        const locSlippage = slippage;
        let updated = false;
        if (slipType === 'stable') {
            locSlippage.stable = newVal;
            updated = true;
        } else if (slipType === 'volatile') {
            locSlippage.volatile = newVal;
            updated = true;
        };
        if (updated) {
            setSlippage(locSlippage);
            localStorage.setItem(`slippage_${slippageType}`, JSON.stringify(locSlippage));
        }
    }

    return {
        stable,
        volatile,
        updateStable: (val: number) => updateSlippage('stable', val),
        updateVolatile: (val: number) => updateSlippage('volatile', val)
    };
}