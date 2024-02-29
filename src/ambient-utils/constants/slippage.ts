// slippage quick select presets in the DOM (three numbers)
export type slippagePresetsType = [number, number, number];
// shape of data object to hold slippage presets
export interface slippageDefaultsIF {
    stable: number;
    volatile: number;
    l2: 1;
    presets: {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
        l2: slippagePresetsType;
    };
}

export const DEFAULT_SLIPPAGE_VALUES: {
    swap: slippageDefaultsIF;
    mint: slippageDefaultsIF;
    repo: slippageDefaultsIF;
} = {
    swap: {
        stable: 0.1,
        volatile: 0.1,
        l2: 1,
        presets: {
            stable: [0.1, 0.3, 0.5],
            volatile: [0.1, 0.3, 0.5],
            l2: [1, 2, 3],
        },
    },
    mint: {
        stable: 1,
        volatile: 3,
        l2: 1,
        presets: {
            stable: [1, 2, 3],
            volatile: [1, 2, 3],
            l2: [1, 2, 3],
        },
    },
    repo: {
        stable: 0.1,
        volatile: 0.5,
        l2: 1,
        presets: {
            stable: [0.1, 0.3, 0.5],
            volatile: [0.1, 0.3, 0.5],
            l2: [1, 2, 3],
        },
    },
};

// string-literal union type of keys in `SLIPPAGE`
export type slippageDefaultTypes = keyof typeof DEFAULT_SLIPPAGE_VALUES;
