/* eslint-disable camelcase */

import { memoizePromiseFn } from './memoizePromiseFn';
const randomNum = Math.random();
import { ANALYTICS_URL } from '../../constants';
import { translateTestnetToken } from '../../utils/data/testnetTokenMap';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';
import { fetchTimeout } from '../../utils/functions/fetchTimeout';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { querySpotPrice } from './querySpotPrice';

export const fetchTokenPrice = async (
    dispToken: string,
    chain: string,
    crocEnv: CrocEnv,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
    const address = translateTestnetToken(dispToken);

    const defaultPair: [TokenIF, TokenIF] =
        supportedNetworks[chain].defaultPair;

    try {
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
    } catch (error) {
        // if token is USDC, return 0.999
        if (address.toLowerCase() === defaultPair[1].address.toLowerCase()) {
            return {
                usdPrice: 0.9995309916951084,
                usdPriceFormatted: 1,
            };
        } else if (
            // if token is ETH, return current value of ETH-USDC pool
            address.toLowerCase() === defaultPair[0].address.toLowerCase()
        ) {
            if (!crocEnv) return;
            const spotPrice = await querySpotPrice(
                crocEnv,
                defaultPair[0].address.toLowerCase(),
                defaultPair[1].address.toLowerCase(),
                chain,
                _lastTime,
            );
            const displayPrice: number =
                1 / toDisplayPrice(spotPrice ?? 0.0005, 18, 6);
            return displayPrice;
        }
        return undefined;
    }
};

export type TokenPriceFn = (
    address: string,
    chain: string,
    crocEnv: CrocEnv,
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
    return (address: string, chain: string, crocEnv: CrocEnv) =>
        memoFn(
            address,
            chain,
            crocEnv,
            Math.floor((Date.now() + randomOffset) / PRICE_WINDOW_GRANULARITY),
        );
}
