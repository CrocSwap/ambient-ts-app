/* eslint-disable camelcase */
import { ZeroAddress } from 'ethers';
import { supportedNetworks } from '../constants/networks';
import {
    isUsdStableToken,
    memoizePromiseFn,
    translateToken,
} from '../dataLayer/functions';
import { fetchBatch } from './fetchBatch';

const randomNum = Math.random();

export const fetchTokenPrice = async (
    dispToken: string,
    chain: string,
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
                      : chain === '0x18231'
                        ? 'plume'
                        : chain === '0x783'
                          ? 'swell'
                          : chain === '0x14a34'
                            ? 'base'
                            : 'ethereum',
            token_address: address,
        };

        const response = await fetchBatch<'price'>(body);

        if ('error' in response) throw new Error(response.error);
        if (response.value.source === '') {
            throw new Error('no source available');
        }
        if (response.value.usdPrice === Infinity) {
            throw new Error('USD value returned as Infinity');
        }
        return response.value;
    } catch (error) {
        const defaultPair = supportedNetworks[chain]?.defaultPair;
        if (!defaultPair) return;
        if (
            // if token is ETH, return current value of mainnet ETH
            dispToken.toLowerCase() === ZeroAddress
        ) {
            const body = {
                config_path: 'price',
                asset_platform: 'ethereum',
                token_address: ZeroAddress,
            };

            const response = await fetchBatch<'price'>(body);

            if ('error' in response) throw new Error(response.error);
            if (response.value.source === '') {
                throw new Error('no source available');
            }
            if (response.value.usdPrice === Infinity) {
                throw new Error('USD value returned as Infinity');
            }
            return response.value;
        } else if (
            // if token is USD stablecoin, return $1
            isUsdStableToken(dispToken)
        ) {
            return {
                usdPrice: 1,
                usdPriceFormatted: 1,
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
) => Promise<TokenPriceFnReturn>;

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
