// slippage quick select presets in the DOM (three numbers)
export type slippagePresetsType = [number, number, number];

// shape of data taken by class constructor for slippage defaults obj
interface defaultsConstructorArgsIF {
    vals: {
        stable: number;
        volatile: number;
        l2Stable: number;
        l2Volatile: number;
    };
    presets: {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
        l2Stable: slippagePresetsType;
        l2Volatile: slippagePresetsType;
    };
}

// shape of data created by the SlippageDefaults class
// this is an extension of the input args (adds a method to get presets on L2)
export interface slippageDefaultsIF extends defaultsConstructorArgsIF {
    getPresets: (isL2: boolean) => {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
    };
}

// class constructor to organize slippage default values for app to consume
class SlippageDefaults implements slippageDefaultsIF {
    vals: {
        stable: number;
        volatile: number;
        l2Stable: number;
        l2Volatile: number;
    };
    presets: {
        stable: slippagePresetsType;
        volatile: slippagePresetsType;
        l2Stable: slippagePresetsType;
        l2Volatile: slippagePresetsType;
    };
    getPresets(isL2: boolean) {
        const { stable, volatile, l2Stable, l2Volatile } = this.presets;
        return {
            stable: isL2 ? l2Stable : stable,
            volatile: isL2 ? l2Volatile : volatile,
        };
    }
    constructor(args: defaultsConstructorArgsIF) {
        this.vals = args.vals;
        this.presets = args.presets;
    }
}

// default values to consume for a swap tx
const SWAP_DEFAULTS: defaultsConstructorArgsIF = {
    vals: {
        stable: 0.25,
        l2Stable: 0.25,
        volatile: 1,
        l2Volatile: 1,
    },
    presets: {
        stable: [0.1, 0.25, 0.5],
        l2Stable: [0.1, 0.25, 0.5],
        volatile: [0.5, 1, 5],
        l2Volatile: [0.5, 1, 5],
    },
};

// default values to consume for a mint tx
const MINT_DEFAULTS: defaultsConstructorArgsIF = {
    vals: {
        stable: 0.25,
        l2Stable: 0.25,
        volatile: 1,
        l2Volatile: 1,
    },
    presets: {
        stable: [0.1, 0.25, 0.5],
        l2Stable: [0.1, 0.25, 0.5],
        volatile: [0.5, 1, 5],
        l2Volatile: [0.5, 1, 5],
    },
};

// default values to consume for a reposition tx
const REPO_DEFAULTS: defaultsConstructorArgsIF = {
    vals: {
        stable: 0.25,
        l2Stable: 0.25,
        volatile: 1,
        l2Volatile: 1,
    },
    presets: {
        stable: [0.1, 0.25, 0.5],
        l2Stable: [0.1, 0.25, 0.5],
        volatile: [0.5, 1, 5],
        l2Volatile: [0.5, 1, 5],
    },
};

// data structure exporting the slippage default data organized by class constructor
export const DEFAULT_SLIPPAGE_VALUES: {
    swap: slippageDefaultsIF;
    mint: slippageDefaultsIF;
    repo: slippageDefaultsIF;
} = {
    swap: new SlippageDefaults(SWAP_DEFAULTS),
    mint: new SlippageDefaults(MINT_DEFAULTS),
    repo: new SlippageDefaults(REPO_DEFAULTS),
};

// string-literal union type of keys in `SLIPPAGE`
export type slippageDefaultTypes = keyof typeof DEFAULT_SLIPPAGE_VALUES;
