const getPoolVolume = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        return 1000;
    } else {
        return 0;
    }
};

const getPoolTVL = async (tokenA: string, tokenB: string, poolIdx: number): Promise<number> => {
    if (tokenA && tokenB && poolIdx) {
        return 2000;
    } else {
        return 0;
    }
};

export { getPoolVolume, getPoolTVL };
