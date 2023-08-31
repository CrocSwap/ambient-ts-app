import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS } from '../../constants';
import { TokenIF } from '../../utils/interfaces/exports';
import { fetchDepositBalances } from './fetchDepositBalances';
import { memoizePromiseFn } from './memoizePromiseFn';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { getFormattedNumber } from './getFormattedNumber';
import { Client } from '@covalenthq/client-sdk';

export interface IDepositedTokenBalance {
    token: string;
    symbol: string;
    decimals: number;
    balance: string;
    balanceDecimalCorrected: number;
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
        const balanceDisplay = toDisplayQty(
            tokenBalanceBigNumber,
            tokenBalance.contract_decimals,
        );
        const balanceDisplayNum = parseFloat(balanceDisplay);

        const balanceDisplayTruncated = getFormattedNumber({
            value: balanceDisplayNum,
        });

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
            walletBalanceDisplay: balanceDisplay,
            walletBalanceDisplayTruncated: balanceDisplayTruncated,
            combinedBalance: tokenBalanceBigNumber.toString(),
            combinedBalanceDisplay: balanceDisplay,
            combinedBalanceDisplayTruncated: balanceDisplayTruncated,
        };
    };

    const getTokenInfoFromCacheBalance = (
        tokenBalance: IDepositedTokenBalance,
    ): TokenIF => {
        const dexBalance = tokenBalance.balance;
        const dexBalanceDisplay = dexBalance
            ? toDisplayQty(dexBalance, tokenBalance.decimals)
            : undefined;
        const dexBalanceDisplayNum = dexBalanceDisplay
            ? parseFloat(dexBalanceDisplay)
            : undefined;
        const dexBalanceDisplayTruncated = getFormattedNumber({
            value: dexBalanceDisplayNum,
        });

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: '',
            address: tokenBalance.token,
            symbol: tokenBalance.symbol,
            decimals: tokenBalance.decimals,
            dexBalance: dexBalance,
            dexBalanceDisplay: dexBalanceDisplay,
            dexBalanceDisplayTruncated: dexBalanceDisplayTruncated,
            combinedBalance: dexBalance,
            combinedBalanceDisplay: dexBalanceDisplay,
            combinedBalanceDisplayTruncated: dexBalanceDisplayTruncated,
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

                const combinedBalance = BigNumber.from(
                    existingToken.combinedBalance,
                )
                    .add(BigNumber.from(newToken.dexBalance))
                    .toString();

                const combinedBalanceDisplay = toDisplayQty(
                    combinedBalance,
                    existingToken.decimals,
                );
                const combinedBalanceDisplayNum = parseFloat(
                    combinedBalanceDisplay,
                );

                const combinedBalanceDisplayTruncated = getFormattedNumber({
                    value: combinedBalanceDisplayNum,
                });

                updatedToken.dexBalance = newToken.dexBalance;
                updatedToken.dexBalanceDisplay = newToken.dexBalanceDisplay;
                updatedToken.dexBalanceDisplayTruncated =
                    newToken.dexBalanceDisplayTruncated;
                updatedToken.combinedBalance = combinedBalance;
                updatedToken.combinedBalanceDisplay = combinedBalanceDisplay;
                updatedToken.combinedBalanceDisplayTruncated =
                    combinedBalanceDisplayTruncated;

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
