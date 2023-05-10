// START: Import React and Dongles
import { useEffect, useMemo, useState } from 'react';

// interface for a Slippage Pair (not needed outside this file)
interface SlippagePairIF {
    stable: number;
    volatile: number;
    presets: {
        stable: number[];
        volatile: number[];
    };
}

// interface for object returned by this hook
export interface SlippageMethodsIF {
    stable: number;
    volatile: number;
    updateStable: (val: number) => void;
    updateVolatile: (val: number) => void;
    presets: { stable: number[]; volatile: number[] };
}

export interface allSlippageMethodsIF {
    swapSlippage: SlippageMethodsIF;
    mintSlippage: SlippageMethodsIF;
    repoSlippage: SlippageMethodsIF;
}

// custom hook to manage and interact a given slippage pair
// @param slippageType ➡ denotes swap, mint, or reposition
// @param defaults ➡ default values to use for slippage
export const useSlippage = (
    slippageType: string,
    defaults: SlippagePairIF,
): SlippageMethodsIF => {
    // fn to get relevant slippage pair from local storage and return
    // ... a value to use productively for stable or volatile slippage
    const getSlippage = (whichOne: string): number => {
        // retrieve the relevant slippage pair from local storage
        // query will return `null` if the key-value pair does not exist
        const pair: SlippagePairIF | null = JSON.parse(
            localStorage.getItem(`slippage_${slippageType}`) as string,
        );
        // declare an output value for the function
        let output: number;
        // router to get the stable or volatile value as specified by params
        // will use default value if local storage did not have a key-val pair
        switch (whichOne) {
            case 'stable':
                output = pair?.stable ?? defaults.stable;
                break;
            case 'volatile':
                output = pair?.volatile ?? defaults.volatile;
                break;
            default:
                output = 0;
        }
        // return output value
        return output;
    };

    // hooks to hold stable and volatile values in state
    // do NOT refactor these as useMemo() hooks, it will not work
    const [stable, setStable] = useState<number>(getSlippage('stable'));
    const [volatile, setVolatile] = useState<number>(getSlippage('volatile'));

    // update persisted value in local storage whenever user changes slippage tolerance
    useEffect(() => {
        localStorage.setItem(
            `slippage_${slippageType}`,
            JSON.stringify({ stable, volatile }),
        );
    }, [stable, volatile]);

    // return data object
    // stable ➡ number, active slippage value for stable pairs
    // volatile ➡ number, active slippage value for non-stable pairs
    // updateStable ➡ accepts a new `stable` value from the DOM
    // updateVolatile ➡ accepts a new `volatile` value from the DOM
    return useMemo(
        () => ({
            stable,
            volatile,
            updateStable: setStable,
            updateVolatile: setVolatile,
            presets: defaults.presets,
        }),
        [stable, volatile],
    );
};
