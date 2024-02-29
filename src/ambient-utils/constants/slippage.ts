// slippage quick select presets in the DOM (three numbers)
export type slippagePresetsType = [number, number, number];
// shape of data object to hold slippage presets
export interface slippageDefaultsIF {
    stable: number;
    volatile: number;
    presets: {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
    };
}

const swap: slippageDefaultsIF = {
    stable: 0.1,
    volatile: 0.1,
    presets: {
        stable: [0.1, 0.3, 0.5],
        volatile: [0.1, 0.3, 0.5],
    },
};

const mint: slippageDefaultsIF = {
    stable: 1,
    volatile: 3,
    presets: {
        stable: [1, 2, 3],
        volatile: [1, 2, 3],
    },
};

const reposition: slippageDefaultsIF = {
    stable: 0.1,
    volatile: 0.5,
    presets: {
        stable: [0.1, 0.3, 0.5],
        volatile: [0.1, 0.3, 0.5],
    },
};

export const slippage = { swap, mint, reposition };
