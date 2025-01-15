import { useContext, useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_SLIPPAGE_VALUES,
    slippageDefaultsIF,
    slippageDefaultTypes,
    slippagePresetsType,
} from '../../ambient-utils/constants';
import { ChainDataContext } from '../../contexts/ChainDataContext';

// interface for object returned by this hook
export interface SlippageMethodsIF {
    stable: number;
    volatile: number;
    updateStable: (val: number) => void;
    updateVolatile: (val: number) => void;
    presets: {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
    };
}

// !important:  this hook supports differential values on L2 networks, this is not
// !important:  ... written in the prettiest way but is allows for differential
// !important:  ... handling without changing any fn calls in the app proper

// custom hook to manage and interact a given slippage pair
// @param slippageType ➡ denotes swap, mint, or reposition
// @param defaults ➡ default values to use for slippage
export const useSlippage = (
    txType: slippageDefaultTypes,
): SlippageMethodsIF => {
    // default slippage values to consume depending on transaction type
    const defaults: slippageDefaultsIF = DEFAULT_SLIPPAGE_VALUES[txType];

    // keygen logic for local storage
    const LS_KEY: string = 'slippage_' + txType;

    // check if active network is an L2 for differential handling
    const { isActiveNetworkL2 } = useContext(ChainDataContext);

    // fn to get relevant slippage pair from local storage and return
    // ... a value to use productively for stable or volatile slippage
    const getSlippage = (
        whichOne: 'stable' | 'volatile' | 'l2Stable' | 'l2Volatile',
    ): number => {
        // retrieve the relevant slippage pair from local storage
        // query will return `null` if the key-value pair does not exist
        const pair: {
            stable: number;
            volatile: number;
            l2Stable: number;
            l2Volatile: number;
        } | null = JSON.parse(localStorage.getItem(LS_KEY) as string);
        // declare an output value for the function
        let output: number;
        // router to get the stable or volatile value as specified by params
        // will use default value if local storage did not have a key-val pair
        switch (whichOne) {
            case 'stable':
                output = pair?.stable ?? defaults.vals.stable;
                break;
            case 'volatile':
                output = pair?.volatile ?? defaults.vals.volatile;
                break;
            case 'l2Stable':
                output = pair?.l2Stable ?? defaults.vals.l2Stable;
                break;
            case 'l2Volatile':
                output = pair?.l2Volatile ?? defaults.vals.l2Volatile;
                break;
            default:
                output = 0.25;
        }
        // return output value
        return output;
    };

    // hooks to hold different slippage values in state
    // l2 is stored separately but preferentially consumed when relevant
    // do NOT refactor these as useMemo() hooks, it will not work
    const [stable, setStable] = useState<number>(getSlippage('stable'));
    const [volatile, setVolatile] = useState<number>(getSlippage('volatile'));
    const [l2Stable, setL2Stable] = useState<number>(getSlippage('l2Stable'));
    const [l2Volatile, setL2Volatile] = useState<number>(
        getSlippage('l2Volatile'),
    );

    // update persisted value in local storage whenever user changes slippage tolerance
    useEffect(() => {
        localStorage.setItem(
            LS_KEY,
            JSON.stringify({ stable, volatile, l2Stable, l2Volatile }),
        );
    }, [stable, volatile, l2Stable, l2Volatile]);

    // return data object
    // stable ➡ number, active slippage value for stable pairs
    // volatile ➡ number, active slippage value for non-stable pairs
    // updateStable ➡ accepts a new `stable` value from the DOM
    // updateVolatile ➡ accepts a new `volatile` value from the DOM
    // !important:  fields will preferentially consume an L2 value as relevant
    return useMemo<SlippageMethodsIF>(
        () => ({
            stable: isActiveNetworkL2 ? l2Stable : stable,
            volatile: isActiveNetworkL2 ? l2Volatile : volatile,
            updateStable: isActiveNetworkL2 ? setL2Stable : setStable,
            updateVolatile: isActiveNetworkL2 ? setL2Volatile : setVolatile,
            presets: defaults.getPresets(isActiveNetworkL2),
        }),
        [stable, volatile, l2Stable, l2Volatile, isActiveNetworkL2],
    );
};
