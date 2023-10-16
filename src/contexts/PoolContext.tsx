import { CrocPoolView } from '@crocswap-libs/sdk';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAccount } from 'wagmi';
import { estimateFrom24HrAmbientApr } from '../App/functions/fetchAprEst';
import { usePoolPricing } from '../App/hooks/usePoolPricing';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import { usePoolList } from '../App/hooks/usePoolList';
import { PoolIF, PoolStatIF } from '../utils/interfaces/exports';
import useFetchPoolStats from '../App/hooks/useFetchPoolStats';

interface PoolContextIF {
    poolList: PoolIF[];
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    poolData: PoolStatIF;
}

export const PoolContext = createContext<PoolContextIF>({} as PoolContextIF);

export const PoolContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv, provider, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        baseToken: { address: baseTokenAddress, decimals: baseTokenDecimals },
        quoteToken: {
            address: quoteTokenAddress,
            decimals: quoteTokenDecimals,
        },
    } = useContext(TradeTokenContext);

    const poolList: PoolIF[] = usePoolList(crocEnv);

    const { tradeData, receiptData, userData } = useAppSelector(
        (state) => state,
    );
    const { isConnected } = useAccount();

    const pool = useMemo(
        () =>
            crocEnv?.pool(
                tradeData.baseToken.address,
                tradeData.quoteToken.address,
            ),
        [crocEnv, tradeData.baseToken.address, tradeData.quoteToken.address],
    );

    const poolArg: PoolIF = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainData.chainId,
        poolIdx: chainData.poolIndex,
    };

    const poolData = useFetchPoolStats(poolArg);

    const [ambientApy, setAmbientApy] = useState<number | undefined>();
    const [dailyVol] = useState<number | undefined>();

    const {
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
    } = usePoolPricing({
        crocEnv,
        pathname: location.pathname,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainData,
        receiptCount: receiptData.sessionReceipts.length,
        isUserLoggedIn: isConnected,
        isUserIdle: userData.isUserIdle,
        lastBlockNumber,
        isServerEnabled,
        cachedQuerySpotPrice,
    });

    const poolContext = {
        poolList,
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        ambientApy,
        dailyVol,
        poolData,
    };

    // Asynchronously query the APY and volatility estimates from the backend
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                provider &&
                baseTokenAddress &&
                quoteTokenAddress &&
                lastBlockNumber > 0
            ) {
                const annualizedGrowth = estimateFrom24HrAmbientApr(
                    baseTokenAddress,
                    quoteTokenAddress,
                    crocEnv,
                    provider,
                    lastBlockNumber,
                );

                setAmbientApy(await annualizedGrowth);
            }
        })();
    }, [
        lastBlockNumber == 0,
        baseTokenAddress,
        quoteTokenAddress,
        chainData.chainId,
        chainData.poolIndex,
        !!crocEnv,
        !!provider,
    ]);

    return (
        <PoolContext.Provider value={poolContext}>
            {props.children}
        </PoolContext.Provider>
    );
};
