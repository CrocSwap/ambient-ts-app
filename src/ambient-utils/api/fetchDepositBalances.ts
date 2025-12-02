import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../types';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { GcgoFetcher } from '../../utils/gcgoFetcher';

interface IFetchDepositBalancesProps {
    user: string;
    gcgo: GcgoFetcher;
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
    const { chainId, user, gcgo } = props;

    const depositBalancesCacheEndpoint = '/user_balance_tokens?';

    return gcgo
        .fetch(
            depositBalancesCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId.toLowerCase(),
                    user: user.toLowerCase(),
                }),
        )
        .then((data) => {
            const tokens = data.tokens as string[];
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
    const [dexBalance, walletBalance] = await Promise.all([
        crocEnv.token(tokenAddress.toLowerCase()).balance(user),
        crocEnv.token(tokenAddress.toLowerCase()).wallet(user),
    ]);

    return {
        tokenAddress,
        dexBalance,
        walletBalance,
    };
}
