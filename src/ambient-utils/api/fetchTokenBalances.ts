/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrocEnv } from '@crocswap-libs/sdk';
import ambientTokenList from '../constants/ambient-token-list.json';
import testnetTokenList from '../constants/testnet-token-list.json';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';
import { TokenIF } from '../types/token/TokenIF';
import {
    fetchDepositBalances,
    IDexTokenBalances,
} from './fetchDepositBalances';

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
    GCGO_URL: string;
    _refreshTime: number;
}

export const fetchAmbientListWalletBalances = async (
    props: IAmbientListBalanceQueryProps,
): Promise<TokenIF[] | undefined> => {
    const { address, crocEnv } = props;

    if (!crocEnv) return;

    const ambientTokensOnActiveChain = ambientTokenList.tokens
        .concat(testnetTokenList.tokens)
        .filter((token: any) => token.chainId === parseInt(props.chain));

    console.log({ ambientTokensOnActiveChain });

    const balancePromises = ambientTokensOnActiveChain.map(async (token) => {
        const walletBalance = (
            await crocEnv.token(token.address.toLowerCase()).wallet(address)
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
    const { address, crocEnv, chain, GCGO_URL } = props;

    if (!crocEnv) return;

    const dexBalancesFromCache = await fetchDepositBalances({
        user: address,
        chainId: chain,
        GCGO_URL: GCGO_URL,
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
