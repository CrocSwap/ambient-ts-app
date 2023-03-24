import { CrocEnv } from '@crocswap-libs/sdk';
// import { Provider } from '@ethersproject/providers';
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

export type SpotPriceFn = (
    crocEnv: CrocEnv,
    baseToken: string,
    quoteToken: string,
    chain: string,
    blockNum: number,
) => Promise<number>;

export function memoizeQuerySpotPrice(): SpotPriceFn {
    return memoizeCrocEnvFn(querySpotPrice) as SpotPriceFn;
}
