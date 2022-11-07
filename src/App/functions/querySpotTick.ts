import { CrocEnv } from '@crocswap-libs/sdk';
// import { Provider } from '@ethersproject/providers';
import { memoizeCrocEnvFn } from './memoizePromiseFn';

export const querySpotTick = async (
    crocEnv: CrocEnv,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    if (!crocEnv) return;
    console.log('querying spot tick');

    return crocEnv.pool(baseTokenAddress, quoteTokenAddress).spotTick();
};

export type SpotTickFn = (
    crocEnv: CrocEnv,
    baseToken: string,
    quoteToken: string,
    chain: string,
    blockNum: number,
) => Promise<number>;

export function memoizeQuerySpotTick(): SpotTickFn {
    return memoizeCrocEnvFn(querySpotTick) as SpotTickFn;
}
