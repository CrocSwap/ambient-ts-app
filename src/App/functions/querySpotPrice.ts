import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';
import { memoizeProviderFn } from './memoizePromiseFn';

export const querySpotPrice = async (
    provider: Provider,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    console.log('Query spot price ' + baseTokenAddress + ' ' + quoteTokenAddress);
    // console.log({ provider });
    const env = new CrocEnv(provider);
    // console.log(
    //     'Query spot price ' + (await env.pool(baseTokenAddress, quoteTokenAddress).spotPrice()),
    // );

    return env.pool(baseTokenAddress, quoteTokenAddress).spotPrice();
};

type SpotPriceFn = (
    provider: Provider,
    baseToken: string,
    quoteToken: string,
    chain: string,
    blockNum: number,
) => Promise<number>;

export function memoizeQuerySpotPrice(): SpotPriceFn {
    return memoizeProviderFn(querySpotPrice) as SpotPriceFn;
}
