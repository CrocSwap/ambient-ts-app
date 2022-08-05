import Moralis from 'moralis';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenBalances = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    // get ENS domain of an address
    const options = { address: address, chain: chain as '0x5' | '0x2a' };

    return await Moralis.Web3API.account.getTokenBalances(options);
};

type TokenBalanceFn = (token: string, chain: string, lastBlock: number) => Promise<TokenIF[]>;

export function memoizeTokenBalance(): TokenBalanceFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalanceFn;
}
