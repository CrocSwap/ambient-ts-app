import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { usePoolMetadata } from '../App/hooks/usePoolMetadata';
import { useTokenPairAllowance } from '../App/hooks/useTokenPairAllowance';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../ambient-utils/constants';
import { AppStateContext, AppStateContextIF } from './AppStateContext';
import { CachedDataContext, CachedDataContextIF } from './CachedDataContext';
import { ChainDataContext, ChainDataContextIF } from './ChainDataContext';
import { ChartContext, ChartContextIF } from './ChartContext';
import { CrocEnvContext, CrocEnvContextIF } from './CrocEnvContext';
import { RangeContext, RangeContextIF } from './RangeContext';
import { TokenContext, TokenContextIF } from './TokenContext';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { UserDataContext, UserDataContextIF } from './UserDataContext';
import {
    TokenBalanceContext,
    TokenBalanceContextIF,
} from './TokenBalanceContext';
import { TradeDataContext, TradeDataContextIF } from './TradeDataContext';
import { ReceiptContext, ReceiptContextIF } from './ReceiptContext';

export interface TradeTokenContextIF {
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
    tokenAAllowance: bigint | undefined;
    tokenBAllowance: bigint | undefined;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
    contextMatchesParams: boolean;
}

export const TradeTokenContext = createContext<TradeTokenContextIF>(
    {} as TradeTokenContextIF,
);

export const TradeTokenContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { graphCacheUrl, chainId, poolIndex },
        server: { isEnabled: isServerEnabled },
        isUserIdle,
    } = useContext<AppStateContextIF>(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedQuerySpotTick,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext<CachedDataContextIF>(CachedDataContext);
    const { crocEnv, provider } = useContext<CrocEnvContextIF>(CrocEnvContext);
    const { lastBlockNumber } =
        useContext<ChainDataContextIF>(ChainDataContext);
    const { setTokenBalance } =
        useContext<TokenBalanceContextIF>(TokenBalanceContext);
    const { isEnabled: isChartEnabled } =
        useContext<ChartContextIF>(ChartContext);
    const { setSimpleRangeWidth } = useContext<RangeContextIF>(RangeContext);
    const { tokens } = useContext<TokenContextIF>(TokenContext);
    const { sessionReceipts } = useContext<ReceiptContextIF>(ReceiptContext);
    const { tokenA, tokenB, baseToken, quoteToken } =
        useContext<TradeDataContextIF>(TradeDataContext);
    const { userAddress, isUserConnected } =
        useContext<UserDataContextIF>(UserDataContext);

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
        contextMatchesParams,
    } = usePoolMetadata({
        crocEnv,
        graphCacheUrl: graphCacheUrl,
        provider,
        pathname: location.pathname,
        chainId: chainId,
        poolIndex: poolIndex,
        userAddress,
        searchableTokens: tokens.tokenUniv,
        receiptCount: sessionReceipts.length,
        lastBlockNumber,
        isServerEnabled,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedQuerySpotTick,
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
    }, [
        isTokenABase,
        baseTokenBalance,
        baseTokenDexBalance,
        quoteTokenBalance,
        quoteTokenDexBalance,
        tokenA,
        tokenB,
    ]);

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
        contextMatchesParams,
    };

    // useEffect to update selected token balances
    useEffect(() => {
        if (
            !isUserIdle &&
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
                .then((bal: bigint) => {
                    const displayBalance = toDisplayQty(bal, baseTokenDecimals);
                    if (displayBalance !== baseTokenBalance) {
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
                .then((bal: bigint) => {
                    const displayBalance = toDisplayQty(bal, baseTokenDecimals);
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
                .then((bal: bigint) => {
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
                .then((bal: bigint) => {
                    const displayBalance = toDisplayQty(
                        bal,
                        quoteTokenDecimals,
                    );
                    if (displayBalance !== quoteTokenDexBalance) {
                        setQuoteTokenDexBalance(displayBalance);
                        setTokenBalance({
                            tokenAddress: quoteToken.address,
                            dexBalance: bal.toString(),
                        });
                    }
                })
                .catch(console.error);
        }
    }, [
        crocEnv,
        isUserIdle,
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
