import { CrocEnv } from '@crocswap-libs/sdk';
import { memoizeCrocEnvFn } from './memoizePromiseFn';
/**
 * Queries the spot price of a token pair from a given CrocSwap environment.
 *
 * @param crocEnv - The CrocSwap environment to query.
 * @param baseTokenAddress - The address of the base token in the token pair.
 * @param quoteTokenAddress - The address of the quote token in the token pair.
 * @param _chainId - (Unused) The chain ID of the blockchain on which to query the spot price.
 * @param _lastBlockNumber - (Unused) The last block number at which to query the spot price.
 * @returns A promise that resolves to the spot price of the token pair.
 */
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
/**
 * The signature of a function that queries the spot price of a token pair from a given CrocSwap environment.
 */
export type SpotPriceFn = (
    crocEnv: CrocEnv,
    baseToken: string,
    quoteToken: string,
    chain: string,
    blockNum: number,
) => Promise<number>;
/**
 * Returns a memoized version of the `querySpotPrice` function.
 *
 * @returns A memoized version of the `querySpotPrice` function.
 */
export function memoizeQuerySpotPrice(): SpotPriceFn {
    return memoizeCrocEnvFn(querySpotPrice) as SpotPriceFn;
}
