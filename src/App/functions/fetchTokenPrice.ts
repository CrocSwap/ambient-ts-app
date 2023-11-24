/* eslint-disable camelcase */

import { memoizePromiseFn } from './memoizePromiseFn';
const randomNum = Math.random();
import { translateTestnetToken } from '../../utils/data/testnetTokenMap';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';
import {
    PriceRequestBodyType,
    fetchBatch,
} from '../../utils/functions/fetchBatch';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { querySpotPrice } from './querySpotPrice';
import truncateDecimals from '../../utils/data/truncateDecimals';

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

        const nonce = address.concat(chain).toLowerCase();

        const body: PriceRequestBodyType = {
            config_path: 'price',
            chain_id: chain,
            token_address: address,
        };

        const { value } = await fetchBatch<'price'>(body, nonce);
        return value;
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
            const twoThousandDollarEthNonDisplay = 500000000;
            const displayPrice: number =
                1 /
                toDisplayPrice(
                    spotPrice ?? twoThousandDollarEthNonDisplay,
                    18,
                    6,
                );
            const usdPriceFormatted = truncateDecimals(displayPrice, 2);
            return {
                usdPrice: displayPrice,
                usdPriceFormatted: usdPriceFormatted,
            };
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

// TODO: remove this after moving over to fetchBatch
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
