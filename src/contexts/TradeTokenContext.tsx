import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { usePoolMetadata } from '../App/hooks/usePoolMetadata';
import { useTokenPairAllowance } from '../App/hooks/useTokenPairAllowance';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../constants';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { RangeContext } from './RangeContext';
import { TokenContext } from './TokenContext';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import { UserDataContext } from './UserDataContext';
import { TokenBalanceContext } from './TokenBalanceContext';
import { TradeDataContext } from './TradeDataContext';

interface TradeTokenContextIF {
    baseToken: {
        address: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    quoteToken: {
        address: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isTokenAEth: boolean;
    isTokenBEth: boolean;
    tokenAAllowance: string;
    tokenBAllowance: string;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
    rtkMatchesParams: boolean;
}

export const TradeTokenContext = createContext<TradeTokenContextIF>(
    {} as TradeTokenContextIF,
);

export const TradeTokenContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv, chainData, provider, activeNetwork } =
        useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { setTokenBalance } = useContext(TokenBalanceContext);

    const { isEnabled: isChartEnabled } = useContext(ChartContext);
    const { setSimpleRangeWidth } = useContext(RangeContext);
    const { tokens } = useContext(TokenContext);

    const { receiptData } = useAppSelector((state) => state);
    const { tokenA, tokenB, baseToken, quoteToken } =
        useContext(TradeDataContext);
    const { userAddress, isUserConnected } = useContext(UserDataContext);
    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useTokenPairAllowance({
        crocEnv,
        userAddress,
        lastBlockNumber,
    });

    const {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        isTokenABase,
        rtkMatchesParams,
    } = usePoolMetadata({
        crocEnv,
        graphCacheUrl: activeNetwork.graphCacheUrl,
        provider,
        pathname: location.pathname,
        chainData,
        userAddress,
        searchableTokens: tokens.tokenUniv,
        receiptCount: receiptData.sessionReceipts.length,
        lastBlockNumber,
        isServerEnabled,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
        setSimpleRangeWidth,
        isChartEnabled,
    });

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] =
        useState<string>('');
    const {
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isTokenAEth,
        isTokenBEth,
    } = useMemo(() => {
        const tokenABalance = isTokenABase
            ? baseTokenBalance
            : quoteTokenBalance;
        const tokenBBalance = isTokenABase
            ? quoteTokenBalance
            : baseTokenBalance;
        const tokenADexBalance = isTokenABase
            ? baseTokenDexBalance
            : quoteTokenDexBalance;
        const tokenBDexBalance = isTokenABase
            ? quoteTokenDexBalance
            : baseTokenDexBalance;

        const isTokenAEth = tokenA.address === ZERO_ADDRESS;
        const isTokenBEth = tokenB.address === ZERO_ADDRESS;
        return {
            tokenABalance,
            tokenBBalance,
            tokenADexBalance,
            tokenBDexBalance,
            isTokenAEth,
            isTokenBEth,
        };
    }, [isTokenABase, baseTokenBalance, quoteTokenBalance, tokenA, tokenB]);

    const tradeTokenContext = {
        baseToken: {
            address: baseTokenAddress,
            balance: baseTokenBalance,
            setBalance: setBaseTokenBalance,
            dexBalance: baseTokenDexBalance,
            setDexBalance: setBaseTokenDexBalance,
            decimals: baseTokenDecimals,
        },
        quoteToken: {
            address: quoteTokenAddress,
            balance: quoteTokenBalance,
            setBalance: setQuoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
            setDexBalance: setQuoteTokenDexBalance,
            decimals: quoteTokenDecimals,
        },
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isTokenAEth,
        isTokenBEth,
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        isTokenABase,
        rtkMatchesParams,
    };

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                userAddress &&
                isUserConnected &&
                baseToken.address &&
                quoteToken.address &&
                baseTokenDecimals &&
                quoteTokenDecimals
            ) {
                crocEnv
                    .token(baseToken.address)
                    .wallet(userAddress)
                    .then((bal: BigNumber) => {
                        const displayBalance = toDisplayQty(
                            bal,
                            baseTokenDecimals,
                        );
                        if (displayBalance !== baseTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting base token wallet balance',
                                );
                            setBaseTokenBalance(displayBalance);

                            setTokenBalance({
                                tokenAddress: baseToken.address,
                                walletBalance: bal.toString(),
                            });
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(baseToken.address)
                    .balance(userAddress)
                    .then((bal: BigNumber) => {
                        const displayBalance = toDisplayQty(
                            bal,
                            baseTokenDecimals,
                        );
                        if (displayBalance !== baseTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting base token dex balance');
                            setBaseTokenDexBalance(displayBalance);
                            setTokenBalance({
                                tokenAddress: baseToken.address,
                                dexBalance: bal.toString(),
                            });
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(quoteToken.address)
                    .wallet(userAddress)
                    .then((bal: BigNumber) => {
                        const displayBalance = toDisplayQty(
                            bal,
                            quoteTokenDecimals,
                        );
                        if (displayBalance !== quoteTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting quote token balance');
                            setQuoteTokenBalance(displayBalance);
                            setTokenBalance({
                                tokenAddress: quoteToken.address,
                                walletBalance: bal.toString(),
                            });
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(quoteToken.address)
                    .balance(userAddress)
                    .then((bal: BigNumber) => {
                        const displayBalance = toDisplayQty(
                            bal,
                            quoteTokenDecimals,
                        );
                        if (displayBalance !== quoteTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting quote token dex balance',
                                );
                            setQuoteTokenDexBalance(displayBalance);
                            setTokenBalance({
                                tokenAddress: quoteToken.address,
                                dexBalance: bal.toString(),
                            });
                        }
                    })
                    .catch(console.error);
            }
        })();
    }, [
        crocEnv,
        isUserConnected,
        userAddress,
        baseToken.address,
        quoteToken.address,
        lastBlockNumber,
        baseTokenDecimals,
        quoteTokenDecimals,
    ]);

    return (
        <TradeTokenContext.Provider value={tradeTokenContext}>
            {props.children}
        </TradeTokenContext.Provider>
    );
};
