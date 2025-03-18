import { toDisplayQty } from '@crocswap-libs/sdk';
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
import { ZERO_ADDRESS } from '../ambient-utils/constants';
import { AppStateContext } from './AppStateContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenBalanceContext } from './TokenBalanceContext';
import { TradeDataContext } from './TradeDataContext';
import { UserDataContext } from './UserDataContext';

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
    isChartVisible: boolean;
}

export const TradeTokenContext = createContext({} as TradeTokenContextIF);

export const TradeTokenContextProvider = (props: { children: ReactNode }) => {
    const {
        isUserIdle,
        activeNetwork: { chainId },
        isTradeRoute,
    } = useContext(AppStateContext);

    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { setTokenBalance } = useContext(TokenBalanceContext);
    const { userAddress, isUserConnected } = useContext(UserDataContext);
    const { tokenA, tokenB, baseToken, quoteToken, isTokenABase } =
        useContext(TradeDataContext);
    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useTokenPairAllowance();

    const {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        contextMatchesParams,
        isChartVisible,
    } = usePoolMetadata();

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
        isChartVisible,
    };

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                isTradeRoute &&
                !isUserIdle &&
                crocEnv &&
                userAddress &&
                isUserConnected &&
                baseToken.address &&
                quoteToken.address &&
                baseTokenDecimals &&
                quoteTokenDecimals &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                crocEnv
                    .token(baseToken.address)
                    .wallet(userAddress)
                    .then((bal: bigint) => {
                        const displayBalance = toDisplayQty(
                            bal,
                            baseTokenDecimals,
                        );
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
                        const displayBalance = toDisplayQty(
                            bal,
                            baseTokenDecimals,
                        );
                        if (displayBalance !== baseTokenDexBalance) {
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
        })();
    }, [
        crocEnv,
        chainId,
        isUserIdle,
        isUserConnected,
        userAddress,
        baseToken.address,
        quoteToken.address,
        lastBlockNumber,
        baseTokenDecimals,
        quoteTokenDecimals,
        isTradeRoute,
    ]);

    return (
        <TradeTokenContext.Provider value={tradeTokenContext}>
            {props.children}
        </TradeTokenContext.Provider>
    );
};
