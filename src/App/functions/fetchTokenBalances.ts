import { toDisplayQty } from '@crocswap-libs/sdk';
import Moralis from 'moralis-v1';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchTokenBalances = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    connectedAccountActive: boolean,
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
                balance: toDisplayQty(nativeBalance.balance, 18),
            },
        ].concat(balances);
    }
    return balances;
};

type TokenBalanceFn = (
    token: string,
    chain: string,
    lastBlock: number,
    connectedAccountActive?: boolean,
) => Promise<TokenIF[]>;

export function memoizeTokenBalance(): TokenBalanceFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalanceFn;
}
