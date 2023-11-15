import { CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS } from '../../constants';
import { TokenIF } from '../../utils/interfaces/exports';
import { fetchDepositBalances } from './fetchDepositBalances';
import { memoizePromiseFn } from './memoizePromiseFn';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { Client } from '@covalenthq/client-sdk';
import { Chains } from '@covalenthq/client-sdk/dist/services/Client';

export interface IDepositedTokenBalance {
    token: string;
    symbol: string;
    decimals: number;
    balance: string;
}

const COVALENT_CHAIN_IDS = {
    '0x1': 'eth-mainnet',
    '0x5': 'eth-goerli',
    '066eed': 'arbitrum-goerli',
    '0x8274f': 'scroll-sepolia-testnet',
    '0x82750': 'scroll-mainnet',
};

export const fetchTokenBalances = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _refreshTime: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    graphCacheUrl: string,
    client: Client,
): Promise<TokenIF[] | undefined> => {
    if (!crocEnv) return;

    const covalentChainString =
        COVALENT_CHAIN_IDS[chain as keyof typeof COVALENT_CHAIN_IDS] ||
        'eth-mainnet';

    const covalentBalancesResponse =
        await client.BalanceService.getTokenBalancesForWalletAddress(
            covalentChainString as Chains,
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
        graphCacheUrl: graphCacheUrl,
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
    address: string,
    chain: string,
    refreshTime: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    graphCacheUrl: string,
    client: Client,
) => Promise<TokenIF[]>;

export function memoizeFetchTokenBalances(): TokenBalancesQueryFn {
    return memoizePromiseFn(fetchTokenBalances) as TokenBalancesQueryFn;
}
