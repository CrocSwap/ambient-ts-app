import { CrocPoolView } from '@crocswap-libs/sdk';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAccount } from 'wagmi';
import { usePoolPricing } from '../App/hooks/usePoolPricing';
import { GRAPHCACHE_URL } from '../constants';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import { usePoolList } from '../App/hooks/usePoolList';
import { TempPoolIF } from '../utils/interfaces/TempPoolIF';

interface PoolContextIF {
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    poolList: TempPoolIF[];
}

export const PoolContext = createContext<PoolContextIF>({} as PoolContextIF);

export const PoolContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        baseToken: { address: baseTokenAddress, decimals: baseTokenDecimals },
        quoteToken: {
            address: quoteTokenAddress,
            decimals: quoteTokenDecimals,
        },
    } = useContext(TradeTokenContext);

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

    const [ambientApy, setAmbientApy] = useState<number | undefined>();
    const [dailyVol, setDailyVol] = useState<number | undefined>();

    const poolList = usePoolList(chainData.chainId, chainData.poolIndex);

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
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        ambientApy,
        dailyVol,
        poolList,
    };

    // Asynchronously query the APY and volatility estimates from the backend
    useEffect(() => {
        (async () => {
            if (isServerEnabled && baseTokenAddress && quoteTokenAddress) {
                const poolAmbientApyCacheEndpoint =
                    GRAPHCACHE_URL + '/pool_ambient_apy_cached?';

                fetch(
                    poolAmbientApyCacheEndpoint +
                        new URLSearchParams({
                            base: baseTokenAddress.toLowerCase(),
                            quote: quoteTokenAddress.toLowerCase(),
                            poolIdx: chainData.poolIndex.toString(),
                            chainId: chainData.chainId,
                            concise: 'true',
                            lookback: '604800',
                            // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                            // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const ambientApy = json?.data?.apy;
                        setAmbientApy(ambientApy);

                        const tickVol = json?.data?.tickStdev;
                        const dailyVol = tickVol ? tickVol / 10000 : undefined;
                        setDailyVol(dailyVol);
                    });
            }
        })();
    }, [
        isServerEnabled,
        lastBlockNumber == 0,
        baseTokenAddress,
        quoteTokenAddress,
        chainData.chainId,
        chainData.poolIndex,
    ]);

    return (
        <PoolContext.Provider value={poolContext}>
            {props.children}
        </PoolContext.Provider>
    );
};
