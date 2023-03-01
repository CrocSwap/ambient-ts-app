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

    const [slippage, setSlippage] = useState<SlippageNewIF>(getSlippage());

    const checkSlippage = (type: string): number => {
        let output: number;
        switch (type) {
            case 'stable':
                output = slippage.stable;
                break;
            case 'volatile':
                output = slippage.volatile;
                break;
            default:
                output = 0;
        }
        return output;
    }

    false && setSlippage;
    false && checkSlippage;
}