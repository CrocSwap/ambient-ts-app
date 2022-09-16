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
    const options = { address: address, chain: chain as '0x5' | '0x2a' };

    const erc20Balances = await Moralis.Web3API.account.getTokenBalances(options);

    let updatedErc20Balances = erc20Balances.map((tokenBalance) => {
        return {
            name: tokenBalance.name,
            address: tokenBalance.token_address,
            symbol: tokenBalance.symbol,
            decimals: tokenBalance.decimals,
            balance: tokenBalance.balance,
        };
    });

    if (!connectedAccountActive) {
        const nativeBalance = await Moralis.Web3API.account.getNativeBalance(options);
        updatedErc20Balances = [
            {
                name: 'Native Token',
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'ETH',
                decimals: 18,
                balance: toDisplayQty(nativeBalance.balance, 18),
            },
        ].concat(updatedErc20Balances);
    }
    return updatedErc20Balances;
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
