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

export const fetchNativeTokenBalance = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    crocEnv: CrocEnv | undefined,
) => {
    if (!crocEnv) return;

    const getDexBalanceNonDisplay = async (
        tokenAddress: string,
        userAddress: string,
    ) => {
        const dexBalance = (
            await crocEnv.token(tokenAddress).balance(userAddress)
        ).toString();
        return dexBalance;
    };

    const getWalletBalanceNonDisplay = async (
        tokenAddress: string,
        userAddress: string,
    ) => {
        const walletBalance = (
            await crocEnv.token(tokenAddress).wallet(userAddress)
        ).toString();
        return walletBalance;
    };

    const nativeDexBalanceNonDisplay = await getDexBalanceNonDisplay(
        ZERO_ADDRESS,
        address,
    );
    const nativeWalletBalanceNonDisplay = await getWalletBalanceNonDisplay(
        ZERO_ADDRESS,
        address,
    );

    const combinedBalanceNonDisplay = BigNumber.from(nativeDexBalanceNonDisplay)
        .add(BigNumber.from(nativeWalletBalanceNonDisplay))
        .toString();

    const nativeDexBalanceDisplay = toDisplayQty(
        nativeDexBalanceNonDisplay,
        18,
    );
    const nativeDexBalanceDisplayNum = parseFloat(nativeDexBalanceDisplay);
    const nativeWalletBalanceDisplay = toDisplayQty(
        nativeWalletBalanceNonDisplay,
        18,
    );
    const nativeWalletBalanceDisplayNum = parseFloat(
        nativeWalletBalanceDisplay,
    );

    const combinedBalanceDisplay = toDisplayQty(combinedBalanceNonDisplay, 18);
    const combinedBalanceDisplayNum = parseFloat(combinedBalanceDisplay);

    const combinedBalanceDisplayTruncated = getFormattedNumber({
        value: combinedBalanceDisplayNum ?? nativeWalletBalanceDisplayNum,
    });
    const nativeDexBalanceDisplayTruncated = getFormattedNumber({
        value: nativeDexBalanceDisplayNum,
    });
    const nativeWalletBalanceDisplayTruncated = getFormattedNumber({
        value: nativeWalletBalanceDisplayNum,
    });

    const updatedNativeToken: TokenIF = {
        chainId: parseInt(chain),
        name: 'Native Ether',
        logoURI:
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        address: ZERO_ADDRESS,
        symbol: 'ETH',
        decimals: 18,
        walletBalance: nativeWalletBalanceNonDisplay,
        walletBalanceDisplay: nativeWalletBalanceDisplay,
        walletBalanceDisplayTruncated: nativeWalletBalanceDisplayTruncated,
        dexBalance: nativeDexBalanceNonDisplay,
        dexBalanceDisplay: nativeDexBalanceDisplay,
        dexBalanceDisplayTruncated: nativeDexBalanceDisplayTruncated,
        combinedBalance: combinedBalanceNonDisplay.toString(),
        combinedBalanceDisplay: combinedBalanceDisplay,
        combinedBalanceDisplayTruncated: combinedBalanceDisplayTruncated,
    };

    return updatedNativeToken;
};

export const fetchErc20TokenBalances = async (
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

    const erc20DexBalancesFromCache = await fetchDepositBalances({
        chainId: chain,
        user: address,
        crocEnv: crocEnv,
        cachedTokenDetails: cachedTokenDetails,
    });

    const combinedErc20Balances: TokenIF[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTokenInfoFromCovalentBalance = (tokenBalance: any): TokenIF => {
        console.log({ tokenBalance });
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
        const erc20DexBalance = tokenBalance.balance;
        const erc20DexBalanceDisplay = erc20DexBalance
            ? toDisplayQty(erc20DexBalance, tokenBalance.decimals)
            : undefined;
        const erc20DexBalanceDisplayNum = erc20DexBalanceDisplay
            ? parseFloat(erc20DexBalanceDisplay)
            : undefined;
        const erc20DexBalanceDisplayTruncated = getFormattedNumber({
            value: erc20DexBalanceDisplayNum,
        });

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: '',
            address: tokenBalance.token,
            symbol: tokenBalance.symbol,
            decimals: tokenBalance.decimals,
            dexBalance: erc20DexBalance,
            dexBalanceDisplay: erc20DexBalanceDisplay,
            dexBalanceDisplayTruncated: erc20DexBalanceDisplayTruncated,
            combinedBalance: erc20DexBalance,
            combinedBalanceDisplay: erc20DexBalanceDisplay,
            combinedBalanceDisplayTruncated: erc20DexBalanceDisplayTruncated,
        };
    };

    const covalentData = covalentBalancesResponse.data.items;

    covalentData.map((tokenBalance) => {
        const newToken: TokenIF = getTokenInfoFromCovalentBalance(tokenBalance);
        combinedErc20Balances.push(newToken);
    });

    if (erc20DexBalancesFromCache !== undefined) {
        erc20DexBalancesFromCache.map(
            (balanceFromCache: IDepositedTokenBalance) => {
                const indexOfExistingToken = (
                    combinedErc20Balances ?? []
                ).findIndex(
                    (existingToken) =>
                        existingToken.address === balanceFromCache.token,
                );

                const newToken = getTokenInfoFromCacheBalance(balanceFromCache);

                if (indexOfExistingToken === -1) {
                    combinedErc20Balances.push(newToken);
                } else {
                    const existingToken =
                        combinedErc20Balances[indexOfExistingToken];

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
                    updatedToken.combinedBalanceDisplay =
                        combinedBalanceDisplay;
                    updatedToken.combinedBalanceDisplayTruncated =
                        combinedBalanceDisplayTruncated;

                    combinedErc20Balances[indexOfExistingToken] = updatedToken;
                }
            },
        );
    }

    return combinedErc20Balances;
};

export type Erc20tokenBalancesQueryFn = (
    token: string,
    chain: string,
    lastBlock: number,
    cachedTokenDetails: FetchContractDetailsFn,
    crocEnv: CrocEnv | undefined,
    client?: Client,
) => Promise<TokenIF[]>;

export type nativetokenBalancesQueryFn = (
    token: string,
    chain: string,
    lastBlock: number,
    crocEnv: CrocEnv | undefined,
) => Promise<TokenIF>;

export function memoizeFetchErc20TokenBalances(): Erc20tokenBalancesQueryFn {
    return memoizePromiseFn(
        fetchErc20TokenBalances,
    ) as Erc20tokenBalancesQueryFn;
}

export function memoizeFetchNativeTokenBalance(): nativetokenBalancesQueryFn {
    return memoizePromiseFn(
        fetchNativeTokenBalance,
    ) as nativetokenBalancesQueryFn;
}
