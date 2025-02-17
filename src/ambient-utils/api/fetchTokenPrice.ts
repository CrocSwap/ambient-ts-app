/* eslint-disable camelcase */
import { ZeroAddress } from 'ethers';
import { PRICE_WINDOW_GRANULARITY } from '../constants';
import { allNetworks } from '../constants/networks';
import { MAINNET_TOKENS } from '../constants/networks/ethereumMainnet';
import {
    isETHorStakedEthToken,
    isPriorityEthEquivalent,
    isUsdStableToken,
    isWbtcToken,
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
    const assetPlatform = allNetworks[chain]?.tokenPriceQueryAssetPlatform;
    if (chain === '0x279f' && address === ZeroAddress) {
        return {
            usdPrice: 1,
            usdPriceFormatted: 1,
        };
    }
    try {
        const body = {
            config_path: 'price',
            asset_platform: assetPlatform ? assetPlatform : 'ethereum',
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
        if (
            // if token is ETH or Staked ETH, return current value of mainnet ETH
            isETHorStakedEthToken(dispToken) ||
            isPriorityEthEquivalent(dispToken)
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
        } else if (isWbtcToken(dispToken)) {
            const body = {
                config_path: 'price',
                asset_platform: 'ethereum',
                token_address: MAINNET_TOKENS.WBTC.address,
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
