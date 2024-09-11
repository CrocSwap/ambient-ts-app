/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../types/token/TokenIF';
import {
    fetchDepositBalances,
    IDexTokenBalances,
} from './fetchDepositBalances';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import ambientTokenList from '../constants/ambient-token-list.json';

export interface IDepositedTokenBalance {
    token: string;
    symbol: string;
    decimals: number;
    balance: string;
    chain: string;
}

export interface IAmbientListBalanceQueryProps {
    address: string;
    chain: string;
    crocEnv: CrocEnv | undefined;
    _refreshTime: number;
}

export interface IDexBalanceQueryProps {
    address: string;
    chain: string;
    crocEnv: CrocEnv | undefined;
    graphCacheUrl: string;
    _refreshTime: number;
}

export const fetchAmbientListWalletBalances = async (
    props: IAmbientListBalanceQueryProps,
): Promise<TokenIF[] | undefined> => {
    const { address, crocEnv } = props;

    if (!crocEnv) return;

    const ambientTokensOnActiveChain = ambientTokenList.tokens.filter(
        (token: any) => token.chainId === parseInt(props.chain),
    );

    const balancePromises = ambientTokensOnActiveChain.map(async (token) => {
        const walletBalance = (
            await crocEnv.token(token.address).wallet(address)
        ).toString();

        return {
            chainId: token.chainId,
            logoURI: '',
            name: token.name,
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            walletBalance: walletBalance,
        };
    });

    const AmbientListWalletBalances = await Promise.all(balancePromises);

    return AmbientListWalletBalances;
};

async function fetchDexBalances(props: IDexBalanceQueryProps) {
    const { address, crocEnv, chain, graphCacheUrl } = props;

    if (!crocEnv) return;

    const dexBalancesFromCache = await fetchDepositBalances({
        user: address,
        chainId: chain,
        graphCacheUrl: graphCacheUrl,
        crocEnv: crocEnv,
    });
    return dexBalancesFromCache;
}

export type AmbientListBalancesQueryFn = (
    props: IAmbientListBalanceQueryProps,
) => Promise<TokenIF[]>;

export type DexBalancesQueryFn = (
    props: IDexBalanceQueryProps,
) => Promise<IDexTokenBalances[] | undefined>;

export function memoizeFetchAmbientListWalletBalances(): AmbientListBalancesQueryFn {
    return memoizePromiseFn(
        fetchAmbientListWalletBalances,
    ) as AmbientListBalancesQueryFn;
}

export function memoizeFetchDexBalances(): DexBalancesQueryFn {
    return memoizePromiseFn(fetchDexBalances) as DexBalancesQueryFn;
}
