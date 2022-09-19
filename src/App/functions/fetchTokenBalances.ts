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
            // console.log({ moralisNativeBalance });
            // console.log({ nativeDexBalance });

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
                balance: nativeBalance.balance,
                // balance: toDisplayQty(nativeBalance.balance, 18),
                dexBalance: nativeDexBalance,
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
        const moralisErc20Balance = tokenBalance.balance;
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
            balance: tokenBalance.balance,
            dexBalance: erc20DexBalance,
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
