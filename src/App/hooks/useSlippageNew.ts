import { useEffect, useState } from 'react';

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
    const getSlippage = (whichOne: string): number => {
        const pair: SlippageNewIF|null = JSON.parse(
            localStorage.getItem(`slippage_${slippageType}`) as string
        );
        let output: number;
        switch (whichOne) {
            case 'stable':
                output = pair?.stable ?? defaults.stable;
                break;
            case 'volatile':
                output = pair?.volatile ?? defaults.volatile;
                break;
            default:
                output = 0;
        };
        return output;
    }

    const [stable, setStable] = useState<number>(getSlippage('stable'));
    const [volatile, setVolatile] = useState<number>(getSlippage('volatile'));

    useEffect(() => {
        localStorage.setItem(`slippage_${slippageType}`, JSON.stringify({stable, volatile}));
    }, [stable, volatile]);

    const updateSlippage = (slipType: string, newVal: number) => {
        switch (slipType) {
            case 'stable':
                setStable(newVal);
                break;
            case 'volatile':
                setVolatile(newVal);
                break;
        }
    }

    return {
        stable,
        volatile,
        updateStable: (val: number) => updateSlippage('stable', val),
        updateVolatile: (val: number) => updateSlippage('volatile', val)
    };
}