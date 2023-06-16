import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { memoizePromiseFn } from './memoizePromiseFn';
// const randomNum = Math.random();

export const fetchTokenPrice = async (
    address: string,
    chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
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
        return undefined;
    }
};

export type TokenPriceFn = (
    address: string,
    chain: string,
) => Promise<
    | {
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
      }
    | undefined
>;

// Refresh USD prices in 15 minute windows
// const PRICE_WINDOW_GRANULARITY = 15 * 60 * 1000;

// const randomOffset = PRICE_WINDOW_GRANULARITY * randomNum;

export function memoizeTokenPrice(): TokenPriceFn {
    const memoFn = memoizePromiseFn(fetchTokenPrice);
    return (address: string, chain: string) =>
        memoFn(
            address,
            chain,
            1, // temporarily removing refetch
            // Math.floor((Date.now() + randomOffset) / PRICE_WINDOW_GRANULARITY),
        );
}
