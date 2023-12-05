const swap = {
    stable: 0.1,
    volatile: 0.1,
    presets: {
        stable: [0.1, 0.3, 0.5],
        volatile: [0.1, 0.3, 0.5],
    },
};

const mint = {
    stable: 1,
    volatile: 3,
    presets: {
        stable: [1, 2, 3],
        volatile: [1, 2, 3],
    },
};

const reposition = {
    stable: 0.1,
    volatile: 0.5,
    presets: {
        stable: [0.1, 0.3, 0.5],
        volatile: [0.1, 0.3, 0.5],
    },
};

export const slippage = { swap, mint, reposition };
