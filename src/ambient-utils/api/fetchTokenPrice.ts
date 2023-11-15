/* eslint-disable camelcase */
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { translateTestnetToken } from '../dataLayer/functions/testnetTokenMap';
import { supportedNetworks } from '../constants/networks';
import { ANALYTICS_URL } from '../constants';

const randomNum = Math.random();
import { fetchTimeout } from '../api/fetchTimeout';
export const fetchTokenPrice = async (
    dispToken: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
    const address = translateTestnetToken(dispToken);

    const defaultPair = supportedNetworks[chain].defaultPair;

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

            const url =
                ANALYTICS_URL +
                new URLSearchParams({
                    service: 'run',
                    config_path: 'price',
                    include_data: '0',
                    token_address: address,
                    asset_platform:
                        chain === '0x82750' || chain === '0x8274f'
                            ? 'scroll'
                            : 'ethereum',
                });

            const response = await fetchTimeout(url);

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
