/* eslint-disable camelcase */
import {
    memoizePromiseFn,
    translateToken,
    querySpotPrice,
    truncateDecimals,
} from '../dataLayer/functions';
import { supportedNetworks } from '../constants/networks';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { fetchBatch } from './fetchBatch';

const randomNum = Math.random();

export const fetchTokenPrice = async (
    dispToken: string,
    chain: string,
    crocEnv: CrocEnv,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastTime: number,
) => {
    const address = translateToken(dispToken, chain);
    try {
        const body = {
            config_path: 'price',
            asset_platform:
                chain === '0x82750'
                    ? 'scroll'
                    : chain === '0x13e31'
                    ? 'blast'
                    : 'ethereum',
            token_address: address,
        };

        const response = await fetchBatch<'price'>(body);

        if ('error' in response) throw new Error(response.error);
        if (response.value.usdPrice === Infinity)
            throw new Error('USD value returned as Infinity');

        return response.value;
    } catch (error) {
        const defaultPair = supportedNetworks[chain]?.defaultPair;
        if (!defaultPair) return;
        // if token is Dai on Scroll, return 0.999
        if (
            chain === '0x82750' &&
            dispToken.toLowerCase() ===
                '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97'
        ) {
            return {
                usdPrice: 0.9995309916951084,
                usdPriceFormatted: 1,
            };
        }
        // if token is USDC, return 0.999
        else if (
            dispToken.toLowerCase() === defaultPair[1].address.toLowerCase()
        ) {
            return {
                usdPrice: 0.9995309916951084,
                usdPriceFormatted: 1,
            };
        } else if (
            // if token is ETH, return current value of ETH-USDC pool
            dispToken.toLowerCase() === defaultPair[0].address.toLowerCase()
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
                    defaultPair[0].decimals,
                    defaultPair[1].decimals,
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

export type TokenPriceFnReturn =
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
    | undefined;

export type TokenPriceFn = (
    address: string,
    chain: string,
    crocEnv: CrocEnv,
) => Promise<TokenPriceFnReturn>;

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
