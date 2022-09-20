import Moralis from 'moralis-v1';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenPrice = async (address: string, chain: string) => {
    // get ENS domain of an address
    const options = { address: address, chain: chain as '0x5' | '0x1' };

    try {
        if (address && chain) {
            const tokenPrice = await Moralis.Web3API.token.getTokenPrice(options);

            return tokenPrice;
        }
    } catch (error) {
        return null;
    }
};

export type TokenPriceFn = (
    address: string,
    chain: string,
) => Promise<{
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
}>;

export function memoizeTokenPrice(): TokenPriceFn {
    return memoizePromiseFn(fetchTokenPrice) as TokenPriceFn;
}
