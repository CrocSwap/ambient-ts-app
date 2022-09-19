import {
    CrocEnv,
    toDisplayQty,
    //  toDisplayQty
} from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Moralis from 'moralis-v1';
import { ZERO_ADDRESS } from '../../constants';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { formatAmount } from '../../utils/numbers';
import { memoizePromiseFn } from './memoizePromiseFn';

interface IMoralisTokenBalance {
    // eslint-disable-next-line camelcase
    token_address: string;
    name: string;
    symbol: string;
    logo?: string | undefined;
    thumbnail?: string | undefined;
    decimals: number;
    balance: string;
}

export const fetchNativeTokenBalance = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    crocEnv: CrocEnv | undefined,
) => {
    if (!crocEnv) return;

    const options = { address: address, chain: chain as '0x5' };

    const getDexBalance = async (tokenAddress: string, userAddress: string) => {
        const dexBalance = (await crocEnv.token(tokenAddress).balance(userAddress)).toString();
        return dexBalance;
    };

    const nativeBalance = await Moralis.Web3API.account.getNativeBalance(options);

    const updatedNativeBalance = Promise.resolve(getDexBalance(ZERO_ADDRESS, address))
        .then((nativeDexBalance) => {
            const moralisNativeBalance = nativeBalance.balance;
            const moralisNativeBalanceDisplay = toDisplayQty(moralisNativeBalance, 18);
            const moralisNativeBalanceDisplayNum = parseFloat(moralisNativeBalanceDisplay);
            const moralisNativeBalanceDisplayTruncated =
                moralisNativeBalanceDisplayNum < 0.0001
                    ? moralisNativeBalanceDisplayNum.toExponential(2)
                    : moralisNativeBalanceDisplayNum < 2
                    ? moralisNativeBalanceDisplayNum.toPrecision(3)
                    : moralisNativeBalanceDisplayNum >= 100000
                    ? formatAmount(moralisNativeBalanceDisplayNum)
                    : moralisNativeBalanceDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const nativeDexBalanceDisplay = nativeDexBalance
                ? toDisplayQty(nativeDexBalance, 18)
                : undefined;
            const nativeDexBalanceDisplayNum = nativeDexBalanceDisplay
                ? parseFloat(nativeDexBalanceDisplay)
                : undefined;
            const nativeDexBalanceDisplayTruncated = nativeDexBalanceDisplayNum
                ? nativeDexBalanceDisplayNum < 0.0001
                    ? nativeDexBalanceDisplayNum.toExponential(2)
                    : nativeDexBalanceDisplayNum < 2
                    ? nativeDexBalanceDisplayNum.toPrecision(3)
                    : nativeDexBalanceDisplayNum >= 100000
                    ? formatAmount(nativeDexBalanceDisplayNum)
                    : nativeDexBalanceDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                : undefined;

            const combinedBalanceNonDisplay = BigNumber.from(moralisNativeBalance)
                .add(BigNumber.from(nativeDexBalance))
                .toString();
            const combinedBalanceDisplay = toDisplayQty(combinedBalanceNonDisplay, 18);

            const combinedBalanceDisplayNum = parseFloat(combinedBalanceDisplay);

            const combinedBalanceDisplayTruncated =
                combinedBalanceDisplayNum < 0.0001
                    ? combinedBalanceDisplayNum.toExponential(2)
                    : combinedBalanceDisplayNum < 2
                    ? combinedBalanceDisplayNum.toPrecision(3)
                    : combinedBalanceDisplayNum >= 100000
                    ? formatAmount(combinedBalanceDisplayNum)
                    : combinedBalanceDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const updatedNativeToken: TokenIF = {
                chainId: parseInt(chain),
                name: 'Native Ether',
                logoURI: '',
                address: ZERO_ADDRESS,
                symbol: 'ETH',
                decimals: 18,
                walletBalance: moralisNativeBalance,
                walletBalanceDisplay: moralisNativeBalanceDisplay,
                walletBalanceDisplayTruncated: moralisNativeBalanceDisplayTruncated,
                dexBalance: nativeDexBalance,
                dexBalanceDisplay: nativeDexBalanceDisplay,
                dexBalanceDisplayTruncated: nativeDexBalanceDisplayTruncated,
                combinedBalance: combinedBalanceNonDisplay,
                combinedBalanceDisplay: combinedBalanceDisplay,
                combinedBalanceDisplayTruncated: combinedBalanceDisplayTruncated,
            };
            return updatedNativeToken;
            // updatedTokens.push(updatedNativeToken);
        })
        .catch(console.log);

    // console.log({ updatedTokens });
    return updatedNativeBalance;
};

export const fetchErc20TokenBalances = async (
    address: string,
    chain: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastBlockNumber: number,
    crocEnv: CrocEnv | undefined,
) => {
    if (!crocEnv) return;

    const options = { address: address, chain: chain as '0x5' | '0x2a' };

    const erc20Balances = await Moralis.Web3API.account.getTokenBalances(options);

    const getDexBalance = async (tokenAddress: string, userAddress: string) => {
        const dexBalance = (await crocEnv.token(tokenAddress).balance(userAddress)).toString();
        return dexBalance;
    };

    const updateMoralisBalance = async (tokenBalance: IMoralisTokenBalance): Promise<TokenIF> => {
        const erc20DexBalance = await getDexBalance(tokenBalance.token_address, address);
        const erc20DexBalanceDisplay = erc20DexBalance
            ? toDisplayQty(erc20DexBalance, tokenBalance.decimals)
            : undefined;
        const erc20DexBalanceDisplayNum = erc20DexBalanceDisplay
            ? parseFloat(erc20DexBalanceDisplay)
            : undefined;
        const erc20DexBalanceDisplayTruncated = erc20DexBalanceDisplayNum
            ? erc20DexBalanceDisplayNum < 0.0001
                ? erc20DexBalanceDisplayNum.toExponential(2)
                : erc20DexBalanceDisplayNum < 2
                ? erc20DexBalanceDisplayNum.toPrecision(3)
                : erc20DexBalanceDisplayNum >= 100000
                ? formatAmount(erc20DexBalanceDisplayNum)
                : erc20DexBalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : undefined;

        const moralisErc20Balance = tokenBalance.balance;
        const moralisErc20BalanceDisplay = toDisplayQty(moralisErc20Balance, tokenBalance.decimals);
        const moralisErc20BalanceDisplayNum = parseFloat(moralisErc20BalanceDisplay);
        const moralisErc20BalanceDisplayTruncated =
            moralisErc20BalanceDisplayNum < 0.0001
                ? moralisErc20BalanceDisplayNum.toExponential(2)
                : moralisErc20BalanceDisplayNum < 2
                ? moralisErc20BalanceDisplayNum.toPrecision(3)
                : moralisErc20BalanceDisplayNum >= 100000
                ? formatAmount(moralisErc20BalanceDisplayNum)
                : moralisErc20BalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        // console.log({ moralisErc20Balance });
        // console.log({ erc20DexBalance });

        const combinedBalanceNonDisplay = BigNumber.from(moralisErc20Balance)
            .add(BigNumber.from(erc20DexBalance))
            .toString();
        const combinedBalanceDisplay = toDisplayQty(
            combinedBalanceNonDisplay,
            tokenBalance.decimals,
        );
        const combinedBalanceDisplayNum = parseFloat(combinedBalanceDisplay);
        const combinedBalanceDisplayTruncated =
            combinedBalanceDisplayNum < 0.0001
                ? combinedBalanceDisplayNum.toExponential(2)
                : combinedBalanceDisplayNum < 2
                ? combinedBalanceDisplayNum.toPrecision(3)
                : combinedBalanceDisplayNum >= 100000
                ? formatAmount(combinedBalanceDisplayNum)
                : combinedBalanceDisplayNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

        return {
            chainId: parseInt(chain),
            logoURI: '',
            name: tokenBalance.name,
            address: tokenBalance.token_address,
            symbol: tokenBalance.symbol,
            decimals: tokenBalance.decimals,
            walletBalance: moralisErc20Balance,
            walletBalanceDisplay: moralisErc20BalanceDisplay,
            walletBalanceDisplayTruncated: moralisErc20BalanceDisplayTruncated,
            dexBalance: erc20DexBalance,
            dexBalanceDisplay: erc20DexBalanceDisplay,
            dexBalanceDisplayTruncated: erc20DexBalanceDisplayTruncated,
            combinedBalance: combinedBalanceNonDisplay,
            combinedBalanceDisplay: combinedBalanceDisplay,
            combinedBalanceDisplayTruncated: combinedBalanceDisplayTruncated,
        };
    };

    const results = Promise.all(erc20Balances.map(updateMoralisBalance)).then((result) => {
        return result;
    });
    return results;
    // console.log({ updatedErc20Tokens });
    // console.log({ map });
    // return updatedErc20Tokens;
    // Promise.all(erc20Balances.map(updateMoralisBalance))
    //     .then((updatedErc20Tokens) => {
    //         console.log({ updatedErc20Tokens });
    //         // updatedTokens.push(...updatedErc20Tokens);
    //         return updatedErc20Tokens;
    //     })
    //     .catch(console.log);

    // console.log({ updatedTokens });
    // if (updatedTokens.length > 0) return updatedTokens;
};

type Erc20TokenBalanceFn = (
    token: string,
    chain: string,
    lastBlock: number,
    crocEnv: CrocEnv | undefined,
) => Promise<TokenIF[]>;

type nativeTokenBalanceFn = (
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
