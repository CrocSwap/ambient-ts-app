import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';
import { memoizeProviderFn } from './memoizePromiseFn';

export const queryTokenDecimals = async (
    provider: Provider,
    tokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
) => {
    console.log('Query token decimals ' + tokenAddress);
    const env = new CrocEnv(provider);
    return env.token(tokenAddress).decimals;
};

type TokenDecimalFn = (provider: Provider, tokenAddr: string, chainId: string) => Promise<number>;

export function memoizeTokenDecimals(): TokenDecimalFn {
    return memoizeProviderFn(queryTokenDecimals) as TokenDecimalFn;
}
