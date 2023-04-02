import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenPrice = async (address: string, chainId: string) => {
    const chain = chainId === '0x1' ? EvmChain.ETHEREUM : EvmChain.ETHEREUM;

    try {
        if (address && chain) {
            const response = await Moralis.EvmApi.token.getTokenPrice({
                address,
                chain,
            });

            const result = response?.result;

            return result;
        }
    } catch (error) {
        return null;
    }
};

export type TokenPriceFn = (
    address: string,
    chain: string,
) => Promise<{
    nativePrice?:
        | {
              value: string;
              decimals: number;
              name: string;
              symbol: string;
          }
        | undefined;
    usdPrice: number;
    exchangeAddress?: string | undefined;
    exchangeName?: string | undefined;
}>;

export function memoizeTokenPrice(): TokenPriceFn {
    return memoizePromiseFn(fetchTokenPrice) as TokenPriceFn;
}
