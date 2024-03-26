/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../types/token/TokenIF';
import { fetchDepositBalances } from './fetchDepositBalances';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { FetchContractDetailsFn } from './fetchContractDetails';
import ambientTokenList from '../constants/ambient-token-list.json';
import testnetTokenList from '../constants/testnet-token-list.json';

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
    _refreshTime: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    graphCacheUrl: string,
    tokenList: TokenIF[],
): Promise<TokenIF[] | undefined> => {
    if (!crocEnv) return;

    const combinedTokenList = ambientTokenList.tokens
        .concat(testnetTokenList.tokens)
        .filter((token: any) => token.chainId === parseInt(chain));

    const combinedBalances: TokenIF[] = [];

    async function fetchDexBalances() {
        if (!crocEnv) return;
        const dexBalancesFromCache = await fetchDepositBalances({
            chainId: chain,
            user: address,
            crocEnv: crocEnv,
            graphCacheUrl: graphCacheUrl,
            cachedTokenDetails: cachedTokenDetails,
            tokenList: tokenList,
        });
        if (dexBalancesFromCache !== undefined) {
            await Promise.all(
                dexBalancesFromCache.map(
                    async (balanceFromCache: IDepositedTokenBalance) => {
                        const indexOfExistingToken = (
                            combinedBalances ?? []
                        ).findIndex(
                            (existingToken) =>
                                existingToken.address.toLowerCase() ===
                                balanceFromCache.token.toLowerCase(),
                        );

                        const newToken =
                            getTokenInfoFromCacheBalance(balanceFromCache);

                        if (indexOfExistingToken === -1) {
                            const tokenBalanceInWallet = (
                                await crocEnv
                                    .token(newToken.address)
                                    .wallet(address)
                            ).toString();
                            const updatedToken = {
                                ...newToken,
                                walletBalance: tokenBalanceInWallet,
                            };
                            combinedBalances.push(updatedToken);
                        } else {
                            const existingToken =
                                combinedBalances[indexOfExistingToken];

                            const updatedToken = { ...existingToken };

                            updatedToken.dexBalance = newToken.dexBalance;

                            combinedBalances[indexOfExistingToken] =
                                updatedToken;
                        }
                    },
                ),
            );
        }
    }

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

    for (const token of combinedTokenList) {
        const tokenInWallet = (
            await crocEnv.token(token.address).wallet(address)
        ).toString();

        const newToken = {
            chainId: token.chainId,
            logoURI: '',
            name: token.name,
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            walletBalance: tokenInWallet,
        };
        combinedBalances.push(newToken);
    }

    await fetchDexBalances();

    return combinedBalances;
};

export type TokenBalancesQueryFn = (
    address: string,
    chain: string,
    refreshTime: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    graphCacheUrl: string,
    tokenList: TokenIF[],
) => Promise<TokenIF[]>;

export function memoizeFetchTokenBalances(): TokenBalancesQueryFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalancesQueryFn;
}
