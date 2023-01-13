import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';
import { memoizeProviderFn } from './memoizePromiseFn';

export const queryTokenDecimals = async (
    crocEnv: CrocEnv,
    tokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
) => {
    console.error('this should not run');

    // console.log('Query token decimals ' +  const env = new CrocEnv(provider);
    return crocEnv.token(tokenAddress).decimals;
};

type TokenDecimalFn = (provider: Provider, tokenAddr: string, chainId: string) => Promise<number>;

export function memoizeTokenDecimals(): TokenDecimalFn {
    return memoizeProviderFn(queryTokenDecimals) as TokenDecimalFn;
}
