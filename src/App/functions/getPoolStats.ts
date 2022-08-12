const getPoolVolume = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        return 1000000000 * Math.random();
    } else {
        return 0;
    }
};

const getPoolTVL = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        return 1000000000 * Math.random();
    } else {
        return 0;
    }
};

export { getPoolVolume, getPoolTVL };
