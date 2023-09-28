import { CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS } from '../../constants';
import { TokenIF } from '../../utils/interfaces/exports';
import { fetchDepositBalances } from './fetchDepositBalances';
import { memoizePromiseFn } from './memoizePromiseFn';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { Client } from '@covalenthq/client-sdk';

export interface IDepositedTokenBalance {
    token: string;
    symbol: string;
    decimals: number;
    balance: string;
}

export const fetchTokenBalances = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    client: Client,
): Promise<TokenIF[] | undefined> => {
    if (!crocEnv) return;

    const covalentChainString =
        chain === '0x5'
            ? 'eth-goerli'
            : chain === '0x66eed'
            ? 'arbitrum-goerli'
            : 'eth-mainnet';

    const covalentBalancesResponse =
        await client.BalanceService.getTokenBalancesForWalletAddress(
            covalentChainString,
            address,
            {
                noSpam: false,
                quoteCurrency: 'USD',
                nft: false,
            },
        );

    const dexBalancesFromCache = await fetchDepositBalances({
        chainId: chain,
        user: address,
        crocEnv: crocEnv,
        cachedTokenDetails: cachedTokenDetails,
    });

    const combinedBalances: TokenIF[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTokenInfoFromCovalentBalance = (tokenBalance: any): TokenIF => {
        const tokenBalanceBigNumber = BigNumber.from(
            tokenBalance.balance.toString(),
        );

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: tokenBalance.contract_name || '',
            address:
                tokenBalance.contract_address ===
                '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
                    ? ZERO_ADDRESS
                    : tokenBalance.contract_address ?? '',
            symbol: tokenBalance.contract_ticker_symbol || '',
            decimals: tokenBalance.contract_decimals || 18,
            walletBalance: tokenBalanceBigNumber.toString(),
        };
    };

    const getTokenInfoFromCacheBalance = (
        tokenBalance: IDepositedTokenBalance,
    ): TokenIF => {
        const dexBalance = tokenBalance.balance;

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: '',
            address: tokenBalance.token,
            symbol: tokenBalance.symbol,
            decimals: tokenBalance.decimals,
            dexBalance: dexBalance,
        };
    };

    const covalentData = covalentBalancesResponse.data.items;

    covalentData.map((tokenBalance) => {
        const newToken: TokenIF = getTokenInfoFromCovalentBalance(tokenBalance);
        combinedBalances.push(newToken);
    });

    if (dexBalancesFromCache !== undefined) {
        dexBalancesFromCache.map((balanceFromCache: IDepositedTokenBalance) => {
            const indexOfExistingToken = (combinedBalances ?? []).findIndex(
                (existingToken) =>
                    existingToken.address === balanceFromCache.token,
            );

            const newToken = getTokenInfoFromCacheBalance(balanceFromCache);

            if (indexOfExistingToken === -1) {
                combinedBalances.push(newToken);
            } else {
                const existingToken = combinedBalances[indexOfExistingToken];

                const updatedToken = { ...existingToken };

                updatedToken.dexBalance = newToken.dexBalance;

                combinedBalances[indexOfExistingToken] = updatedToken;
            }
        });
    }

    return combinedBalances;
};

export type TokenBalancesQueryFn = (
    token: string,
    chain: string,
    lastBlock: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    client?: Client,
) => Promise<TokenIF[]>;

export function memoizeFetchTokenBalances(): TokenBalancesQueryFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalancesQueryFn;
}
