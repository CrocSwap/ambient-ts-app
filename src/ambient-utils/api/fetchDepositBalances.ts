import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_OVERRIDE_URL } from '../constants';
import { TokenIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';

interface IFetchDepositBalancesProps {
    user: string;
    graphCacheUrl: string;
    chainId: string;
    crocEnv: CrocEnv;
}

export interface IDexTokenBalances {
    tokenAddress: string;
    dexBalance: bigint;
    walletBalance: bigint;
}

export const expandTokenBalances = async (
    tokenBalances: IDexTokenBalances,
    tokenList: TokenIF[],
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv,
    chainId: string,
): Promise<TokenIF> => {
    const tokenAddress = tokenBalances.tokenAddress;

    const tokenListedSymbol = tokenList.find(
        (listedToken) =>
            listedToken.address.toLowerCase() === tokenAddress.toLowerCase(),
    )?.symbol;

    const tokenListedDecimals = tokenList.find(
        (listedToken) =>
            listedToken.address.toLowerCase() === tokenAddress.toLowerCase(),
    )?.decimals;

    const symbol = tokenListedSymbol
        ? tokenListedSymbol
        : cachedTokenDetails(
              (await crocEnv.context).provider,
              tokenAddress,
              chainId,
          ).then((d) => d?.symbol || '');

    const decimals = tokenListedDecimals
        ? tokenListedDecimals
        : crocEnv.token(tokenAddress).decimals;

    return {
        chainId: parseInt(chainId),
        logoURI: '',
        name: '',
        address: tokenBalances.tokenAddress,
        symbol: await symbol,
        decimals: await decimals,
        dexBalance: tokenBalances.dexBalance.toString(),
    };
};
export async function fetchDepositBalances(
    props: IFetchDepositBalancesProps,
): Promise<IDexTokenBalances[] | undefined> {
    const { chainId, user } = props;

    const depositBalancesCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_balance_tokens?'
        : props.graphCacheUrl + '/user_balance_tokens?';

    return fetch(
        depositBalancesCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                user: user,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            if (!json?.data?.tokens) {
                return undefined;
            }

            const tokens = json.data.tokens as string[];
            return Promise.all(
                tokens.map((t) =>
                    addTokenBalances(t, props.crocEnv, props.user),
                ),
            );
        })
        .catch((e) => {
            console.warn(e);
            return undefined;
        });
}

async function addTokenBalances(
    tokenAddress: string,
    crocEnv: CrocEnv,
    user: string,
): Promise<IDexTokenBalances> {
    return {
        tokenAddress: tokenAddress,
        dexBalance: await crocEnv.token(tokenAddress).balance(user),
        walletBalance: await crocEnv.token(tokenAddress).wallet(user),
    };
}
