import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { memoizePromiseFn } from './memoizePromiseFn';
/**

Fetches the price of a token on the given chain from the Moralis token API.
@param address - The address of the token to fetch the price for.
@param chainId - The chain ID of the chain to fetch the price on.
@returns A Promise that resolves to an object containing the native and USD price of the token, as well as the address and name of the exchange used to fetch the price.
*/
export const fetchTokenPrice = async (address: string, chainId: string) => {
    const chain = chainId === '0x1' ? EvmChain.ETHEREUM : EvmChain.ETHEREUM;

    try {
        if (address && chain) {
            // Fetch the token price using the Moralis token API

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
