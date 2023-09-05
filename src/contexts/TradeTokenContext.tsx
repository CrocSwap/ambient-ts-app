import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePoolMetadata } from '../App/hooks/usePoolMetadata';
import { useTokenPairAllowance } from '../App/hooks/useTokenPairAllowance';
import { IS_LOCAL_ENV } from '../constants';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { RangeContext } from './RangeContext';
import { TokenContext } from './TokenContext';
import { setTokenBalance } from '../utils/state/userDataSlice';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';

interface TradeTokenContextIF {
    baseToken: {
        address: string;
        mainnetAddress: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    quoteToken: {
        address: string;
        mainnetAddress: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    tokenAAllowance: string;
    tokenBAllowance: string;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
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
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { isEnabled: isChartEnabled } = useContext(ChartContext);
    const { setSimpleRangeWidth } = useContext(RangeContext);
    const { tokens } = useContext(TokenContext);

    const { tradeData, receiptData } = useAppSelector((state) => state);
    const dispatchRTK = useAppDispatch();
    const { address: userAddress, isConnected } = useAccount();
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
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        isTokenABase,
    } = usePoolMetadata({
        crocEnv,
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

    const tradeTokenContext = {
        baseToken: {
            address: baseTokenAddress,
            mainnetAddress: mainnetBaseTokenAddress,
            balance: baseTokenBalance,
            setBalance: setBaseTokenBalance,
            dexBalance: baseTokenDexBalance,
            setDexBalance: setBaseTokenDexBalance,
            decimals: baseTokenDecimals,
        },
        quoteToken: {
            address: quoteTokenAddress,
            mainnetAddress: mainnetQuoteTokenAddress,
            balance: quoteTokenBalance,
            setBalance: setQuoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
            setDexBalance: setQuoteTokenDexBalance,
            decimals: quoteTokenDecimals,
        },
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        isTokenABase,
    };

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                userAddress &&
                isConnected &&
                tradeData.baseToken.address &&
                tradeData.quoteToken.address &&
                baseTokenDecimals &&
                quoteTokenDecimals
            ) {
                crocEnv
                    .token(tradeData.baseToken.address)
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
                            dispatchRTK(
                                setTokenBalance({
                                    tokenAddress: tradeData.baseToken.address,
                                    walletBalance: bal.toString(),
                                }),
                            );
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.baseToken.address)
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
                            dispatchRTK(
                                setTokenBalance({
                                    tokenAddress: tradeData.baseToken.address,
                                    dexBalance: bal.toString(),
                                }),
                            );
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.quoteToken.address)
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
                            dispatchRTK(
                                setTokenBalance({
                                    tokenAddress: tradeData.quoteToken.address,
                                    walletBalance: bal.toString(),
                                }),
                            );
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.quoteToken.address)
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
                            dispatchRTK(
                                setTokenBalance({
                                    tokenAddress: tradeData.quoteToken.address,
                                    dexBalance: bal.toString(),
                                }),
                            );
                        }
                    })
                    .catch(console.error);
            }
        })();
    }, [
        crocEnv,
        isConnected,
        userAddress,
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
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
