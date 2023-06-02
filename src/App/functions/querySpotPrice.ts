import { CrocEnv } from '@crocswap-libs/sdk';
import { memoizeCrocEnvFn } from './memoizePromiseFn';

export const querySpotPrice = async (
    crocEnv: CrocEnv,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    if (!crocEnv) {
        return;
    }

    return crocEnv.pool(baseTokenAddress, quoteTokenAddress).spotPrice();
};

export const queryPoolGrowth = async (
    crocEnv: CrocEnv,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    if (!crocEnv) {
        return;
    }

    return crocEnv.pool(baseTokenAddress, quoteTokenAddress).cumAmbientGrowth();
};

export type PoolQueryFn = (
    crocEnv: CrocEnv,
    baseToken: string,
    quoteToken: string,
    chain: string,
    blockNum: number,
) => Promise<number>;

export type SpotPriceFn = PoolQueryFn;

export function memoizeQuerySpotPrice(): PoolQueryFn {
    return memoizeCrocEnvFn(querySpotPrice) as PoolQueryFn;
}

export function memoizeQueryPoolGrowth(): PoolQueryFn {
    return memoizeCrocEnvFn(queryPoolGrowth) as PoolQueryFn;
}
