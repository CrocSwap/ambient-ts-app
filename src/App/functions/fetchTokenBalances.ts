import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Moralis from 'moralis';
import { Erc20Value } from '@moralisweb3/common-evm-utils';
import { ZERO_ADDRESS } from '../../constants';
import { TokenIF } from '../../utils/interfaces/exports';
import { formatAmountOld } from '../../utils/numbers';
import { fetchDepositBalances } from './fetchDepositBalances';
import { memoizePromiseFn } from './memoizePromiseFn';

export interface IDepositedTokenBalance {
    token: string;
    symbol: string;
    decimals: number;
    balance: string;
    balanceDecimalCorrected: number;
    balanceStorageSlot: string;
}

export const fetchNativeTokenBalance = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    crocEnv: CrocEnv | undefined,
) => {
    if (!crocEnv) {
        return;
    }

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

    // TODO (#1569): re-usable token display formatting would cut down on copypasta here and below with ...Truncated values.
    const combinedBalanceDisplayTruncated =
        combinedBalanceDisplayNum !== undefined
            ? !combinedBalanceDisplayNum
                ? '0.00'
                : combinedBalanceDisplayNum < 0.0001
                ? combinedBalanceDisplayNum.toExponential(2)
                : combinedBalanceDisplayNum < 2
                ? combinedBalanceDisplayNum.toPrecision(3)
                : combinedBalanceDisplayNum >= 100000
                ? formatAmountOld(nativeWalletBalanceDisplayNum)
                : combinedBalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : undefined;

    const nativeDexBalanceDisplayTruncated = nativeDexBalanceDisplayNum
        ? nativeDexBalanceDisplayNum < 0.0001
            ? nativeDexBalanceDisplayNum.toExponential(2)
            : nativeDexBalanceDisplayNum < 2
            ? nativeDexBalanceDisplayNum.toPrecision(3)
            : nativeDexBalanceDisplayNum >= 100000
            ? formatAmountOld(nativeDexBalanceDisplayNum)
            : nativeDexBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const nativeWalletBalanceDisplayTruncated = nativeWalletBalanceDisplayNum
        ? nativeWalletBalanceDisplayNum < 0.0001
            ? nativeWalletBalanceDisplayNum.toExponential(2)
            : nativeWalletBalanceDisplayNum < 2
            ? nativeWalletBalanceDisplayNum.toPrecision(3)
            : nativeWalletBalanceDisplayNum >= 100000
            ? formatAmountOld(nativeWalletBalanceDisplayNum)
            : nativeWalletBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const updatedNativeToken: TokenIF = {
        chainId: parseInt(chain),
        name: 'Native Ether',
        logoURI: '',
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
    crocEnv: CrocEnv | undefined,
): Promise<TokenIF[] | undefined> => {
    if (!crocEnv) {
        location.reload();
        return;
    }

    // Doesn't have to be comprehensive, just to satisfy typescript
    type MoralisChainIDs = '0x1';
    const options = { address: address, chain: chain as MoralisChainIDs };

    const erc20WalletBalancesFromMoralis =
        await Moralis.EvmApi.token.getWalletTokenBalances(options);

    const erc20DexBalancesFromCache = await fetchDepositBalances({
        chainId: chain,
        user: address,
    });

    const combinedErc20Balances: TokenIF[] = [];

    const getTokenInfoFromMoralisBalance = (
        erc20value: Erc20Value,
    ): TokenIF => {
        const moralisErc20Balance = BigNumber.from(
            erc20value.amount.toString(),
        );
        const moralisErc20BalanceDisplay = toDisplayQty(
            moralisErc20Balance,
            erc20value.decimals,
        );
        const moralisErc20BalanceDisplayNum = parseFloat(
            moralisErc20BalanceDisplay,
        );
        // TODO (#1569): re-usable token display formatting
        const moralisErc20BalanceDisplayTruncated =
            moralisErc20BalanceDisplayNum < 0.0001
                ? moralisErc20BalanceDisplayNum.toExponential(2)
                : moralisErc20BalanceDisplayNum < 2
                ? moralisErc20BalanceDisplayNum.toPrecision(3)
                : moralisErc20BalanceDisplayNum >= 100000
                ? formatAmountOld(moralisErc20BalanceDisplayNum)
                : moralisErc20BalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: erc20value.token?.name || '',
            address: erc20value.token?.contractAddress.lowercase || '',
            symbol: erc20value.token?.symbol || '',
            decimals: erc20value.token?.decimals || 18,
            walletBalance: moralisErc20Balance.toString(),
            walletBalanceDisplay: moralisErc20BalanceDisplay,
            walletBalanceDisplayTruncated: moralisErc20BalanceDisplayTruncated,
            combinedBalance: moralisErc20Balance.toString(),
            combinedBalanceDisplay: moralisErc20BalanceDisplay,
            combinedBalanceDisplayTruncated:
                moralisErc20BalanceDisplayTruncated,
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
        // TODO (#1569): re-usable token display formatting
        const erc20DexBalanceDisplayTruncated = erc20DexBalanceDisplayNum
            ? erc20DexBalanceDisplayNum < 0.0001
                ? erc20DexBalanceDisplayNum.toExponential(2)
                : erc20DexBalanceDisplayNum < 2
                ? erc20DexBalanceDisplayNum.toPrecision(3)
                : erc20DexBalanceDisplayNum >= 100000
                ? formatAmountOld(erc20DexBalanceDisplayNum)
                : erc20DexBalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : undefined;

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

    const jsonResponse = erc20WalletBalancesFromMoralis.result;

    jsonResponse.map((erc20value) => {
        const newToken: TokenIF = getTokenInfoFromMoralisBalance(erc20value);
        combinedErc20Balances.push(newToken);
    });

    if (erc20DexBalancesFromCache !== undefined) {
        erc20DexBalancesFromCache.tokens.map(
            (balanceFromCache: IDepositedTokenBalance) => {
                if (balanceFromCache.token === ZERO_ADDRESS) return;

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

                    // TODO (#1569): re-usable token display formatting
                    const combinedBalanceDisplayTruncated =
                        combinedBalanceDisplayNum
                            ? combinedBalanceDisplayNum < 0.0001
                                ? combinedBalanceDisplayNum.toExponential(2)
                                : combinedBalanceDisplayNum < 2
                                ? combinedBalanceDisplayNum.toPrecision(3)
                                : combinedBalanceDisplayNum >= 100000
                                ? formatAmountOld(combinedBalanceDisplayNum)
                                : combinedBalanceDisplayNum.toLocaleString(
                                      undefined,
                                      {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      },
                                  )
                            : undefined;

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

export type Erc20TokenBalanceFn = (
    token: string,
    chain: string,
    lastBlock: number,
    crocEnv: CrocEnv | undefined,
) => Promise<TokenIF[]>;

export type nativeTokenBalanceFn = (
    token: string,
    chain: string,
    lastBlock: number,
    crocEnv: CrocEnv | undefined,
) => Promise<TokenIF>;

export function memoizeFetchErc20TokenBalances(): Erc20TokenBalanceFn {
    return memoizePromiseFn(fetchErc20TokenBalances) as Erc20TokenBalanceFn;
}

export function memoizeFetchNativeTokenBalance(): nativeTokenBalanceFn {
    return memoizePromiseFn(fetchNativeTokenBalance) as nativeTokenBalanceFn;
}
