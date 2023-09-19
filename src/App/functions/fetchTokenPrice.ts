/* eslint-disable camelcase */

import { memoizePromiseFn } from './memoizePromiseFn';
const randomNum = Math.random();
import { ANALYTICS_URL } from '../../constants';

export const fetchTokenPrice = async (
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
    try {
        if (address) {
            const response = await fetch(
                ANALYTICS_URL +
                    new URLSearchParams({
                        service: 'run',
                        config_path: 'price',
                        include_data: '0',
                        token_address: address,
                    }),
            );
            const result = await response.json();
            return result?.value;
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
const PRICE_WINDOW_GRANULARITY = 15 * 60 * 1000;

const randomOffset = PRICE_WINDOW_GRANULARITY * randomNum;

export function memoizeTokenPrice(): TokenPriceFn {
    const memoFn = memoizePromiseFn(fetchTokenPrice);
    return (address: string, chain: string) =>
        memoFn(
            address,
            chain,
            Math.floor((Date.now() + randomOffset) / PRICE_WINDOW_GRANULARITY),
        );
}
