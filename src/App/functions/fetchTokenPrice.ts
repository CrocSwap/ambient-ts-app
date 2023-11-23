/* eslint-disable camelcase */

import { memoizePromiseFn } from './memoizePromiseFn';
const randomNum = Math.random();
import { translateTestnetToken } from '../../utils/data/testnetTokenMap';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';
import { fetchBatchTokenPrice } from '../../utils/functions/fetchBatch';

export const fetchTokenPrice = async (
    dispToken: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
    const address = translateTestnetToken(dispToken);

    const defaultPair: [TokenIF, TokenIF] =
        supportedNetworks[chain].defaultPair;

    try {
        if (address) {
            if (
                address.toLowerCase() === defaultPair[1].address.toLowerCase()
            ) {
                return {
                    usdPrice: 0.9995309916951084,
                    usdPriceFormatted: 1,
                };
            } else if (
                address.toLowerCase() === defaultPair[0].address.toLowerCase()
            ) {
                return {
                    usdPrice: 2000,
                    usdPriceFormatted: 2000,
                };
            }

            const result = await fetchBatchTokenPrice(address, chain);
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
const PRICE_WINDOW_GRANULARITY = 15 * 60 * 1000;

const randomOffset = PRICE_WINDOW_GRANULARITY * randomNum;

// TODO: remove this after moving over to fetchBatch
export function memoizeTokenPrice(): TokenPriceFn {
    const memoFn = memoizePromiseFn(fetchTokenPrice);
    return (address: string, chain: string) =>
        memoFn(
            address,
            chain,
            Math.floor((Date.now() + randomOffset) / PRICE_WINDOW_GRANULARITY),
        );
}
