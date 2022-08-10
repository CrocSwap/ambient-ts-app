import Moralis from 'moralis';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenBalances = async (
    address: string,
    chain: string,
    connectedAccountActive: boolean,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
) => {
    // get ENS domain of an address
    const options = { address: address, chain: chain as '0x5' | '0x2a' };

    let balances = await Moralis.Web3API.account.getTokenBalances(options);

    if (!connectedAccountActive) {
        const nativeBalance = await Moralis.Web3API.account.getNativeBalance(options);
        balances = [
            {
                name: 'Native Token',
                // eslint-disable-next-line camelcase
                token_address: '0x0000000000000000000000000000000000000000',
                symbol: 'ETH',
                decimals: 18,
                balance: nativeBalance.balance,
            },
        ].concat(balances);
    }
    return balances;
};

type TokenBalanceFn = (token: string, chain: string, lastBlock: number) => Promise<TokenIF[]>;

export function memoizeTokenBalance(): TokenBalanceFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalanceFn;
}
