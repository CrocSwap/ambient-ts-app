import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenPrice = async (
    address: string,
    chainId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
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

export function memoizeTokenPrice(): TokenPriceFn {
    return memoizePromiseFn(fetchTokenPrice);
}
