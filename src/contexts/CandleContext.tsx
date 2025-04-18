import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    GraphDataContext,
    PoolContext,
    ReceiptContext,
    TradeDataContext,
    TradeTokenContext,
} from '.';
import { fetchCandleSeriesHybrid } from '../ambient-utils/api';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    LS_KEY_CHART_SETTINGS,
} from '../ambient-utils/constants';
import { getLocalStorageItem } from '../ambient-utils/dataLayer';
import {
    CandleDataIF,
    CandleDomainIF,
    CandlesByPoolAndDurationIF,
    CandleScaleIF,
} from '../ambient-utils/types';
import { chartSettingsIF } from '../App/hooks/useChartSettings';
import { useSimulatedIsPoolInitialized } from '../App/hooks/useSimulatedIsPoolInitialized';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
export interface CandleContextIF {
    candleData: CandlesByPoolAndDurationIF | undefined;
    setCandleData: Dispatch<
        SetStateAction<CandlesByPoolAndDurationIF | undefined>
    >;

    isManualCandleFetchRequested: boolean;
    setIsManualCandleFetchRequested: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    isFetchingCandle: boolean;
    setIsFetchingCandle: Dispatch<SetStateAction<boolean>>;
    candleDomains: CandleDomainIF;
    setCandleDomains: Dispatch<SetStateAction<CandleDomainIF>>;
    candleScale: CandleScaleIF;
    setCandleScale: Dispatch<SetStateAction<CandleScaleIF>>;
    candleTimeLocal: number | undefined;
    timeOfEndCandle: number | undefined;
    isCondensedModeEnabled: boolean;
    setIsCondensedModeEnabled: Dispatch<SetStateAction<boolean>>;
    showFutaCandles: boolean;
    setShowFutaCandles: Dispatch<SetStateAction<boolean>>;
    setIsChartOpen: Dispatch<SetStateAction<boolean>>;
}

export const CandleContext = createContext({} as CandleContextIF);

export const CandleContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserOnline,
        isUserIdle,
    } = useContext(AppStateContext);

    const { userTransactionsByPool } = useContext(GraphDataContext);
    const { sessionReceipts } = useContext(ReceiptContext);

    const {
        chartSettings,
        isEnabled: isChartEnabled,
        isCandleDataNull,
        setIsCandleDataNull,
    } = useContext(ChartContext);

    const { isChartVisible } = useContext(TradeTokenContext);
    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const { poolData } = useContext(PoolContext);

    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const baseTokenAddressRef = useRef(baseTokenAddress);
    const quoteTokenAddressRef = useRef(quoteTokenAddress);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDurationIF | undefined
    >();
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();

    const [timeOfEndCandle, setTimeOfEndCandle] = useState<
        number | undefined
    >();

    const [isCondensedModeEnabled, setIsCondensedModeEnabled] = useState(true);
    const [showFutaCandles, setShowFutaCandles] = useState(false);

    const [isFetchingCandle, setIsFetchingCandle] = useState(false);
    const [isFinishRequest, setIsFinishRequest] = useState(false);
    const [candleDomains, setCandleDomains] = useState<CandleDomainIF>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
        isAbortedRequest: false,
        isResetRequest: false,
        isCondensedFetching: false,
    });

    const [offlineFetcher, setOfflineFetcher] = useState<NodeJS.Timeout>();

    const [isChartOpen, setIsChartOpen] = useState(false);

    const offlineFetcherRef = useRef<NodeJS.Timeout>();
    offlineFetcherRef.current = offlineFetcher;

    const poolTokenAddress = (
        baseTokenAddress + quoteTokenAddress
    ).toLowerCase();

    useEffect(() => {
        if (isFinishRequest) {
            // If there is no data in the range in which the data is received, it will send a pull request for the first 200 candles
            if (
                candleData?.candles.length === 0 &&
                candleScale?.isFetchFirst200Candle !== true
            ) {
                setCandleData(undefined);
                setCandleScale((prev) => {
                    return {
                        lastCandleDate: undefined,
                        nCandles: 200,
                        isFetchForTimeframe: !prev.isFetchForTimeframe,
                        isShowLatestCandle: true,
                        isFetchFirst200Candle: true,
                    };
                });
            }
        }
    }, [isFinishRequest]);

    const [candleScale, setCandleScale] = useState<CandleScaleIF>({
        lastCandleDate: undefined,
        nCandles: 200,
        isFetchForTimeframe: false,
        isShowLatestCandle: true,
        isFetchFirst200Candle: true,
    });

    const [isFirstFetch, setIsFirstFetch] = useState(true);
    // local logic to determine current chart period
    // this is situation-dependant but used in this file
    const candleTimeLocal = useMemo(() => {
        return chartSettings.candleTime.global.time;
    }, [chartSettings.candleTime.global.time, location.pathname]);

    const [isManualCandleFetchRequested, setIsManualCandleFetchRequested] =
        useState(false);

    const candleContext = {
        candleData,
        setCandleData,
        isCandleSelected,
        setIsCandleSelected,
        isManualCandleFetchRequested,
        setIsManualCandleFetchRequested,
        isFetchingCandle,
        setIsFetchingCandle,
        candleDomains,
        setCandleDomains,
        candleScale,
        setCandleScale,
        candleTimeLocal,
        timeOfEndCandle,
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        showFutaCandles,
        setShowFutaCandles,
        setIsChartOpen,
    };

    useEffect(() => {
        setIsFirstFetch(true);
    }, [isFirstFetch]);

    useEffect(() => {
        if (candleData !== undefined) {
            setCandleData(undefined);
            setTimeOfEndCandle(undefined);
            setIsCondensedModeEnabled(true);
        }

        baseTokenAddressRef.current = baseTokenAddress.toLowerCase();
        quoteTokenAddressRef.current = quoteTokenAddress.toLowerCase();
    }, [poolTokenAddress, chainId]);

    // only works when the period changes
    useEffect(() => {
        setCandleData(undefined);
        setTimeOfEndCandle(undefined);
    }, [candleScale?.isFetchForTimeframe]);

    /**
     * this is for the first fetch (initial load, switching network, changing period, or switching pool).
     */
    useEffect(() => {
        (async () => {
            if (
                isChartVisible &&
                crocEnv &&
                isUserOnline &&
                (await crocEnv.context).chain.chainId === chainId &&
                isChartEnabled &&
                baseTokenAddressRef.current ===
                    baseTokenAddress.toLowerCase() &&
                quoteTokenAddressRef.current ===
                    quoteTokenAddress.toLowerCase() &&
                candleData === undefined
            ) {
                fetchCandles();
                if (isManualCandleFetchRequested)
                    setIsManualCandleFetchRequested(false);
            }
        })();
    }, [
        isChartVisible,
        isManualCandleFetchRequested,
        isChartEnabled,
        isUserOnline,
        isPoolInitialized,
        candleData === undefined,
        crocEnv,
        chainId,
        baseTokenAddressRef.current === baseTokenAddress.toLowerCase(),
        quoteTokenAddressRef.current === quoteTokenAddress.toLowerCase(),
    ]);

    const fetchFirst200Candles = () => {
        fetchCandlesByNumDurations(200, 0);
    };

    /**
     * only works if candles pilling up on the right
     */
    useEffect(() => {
        if (candleDomains.isResetRequest) {
            fetchFirst200Candles();
        }
    }, [candleDomains.isResetRequest]);

    useEffect(() => {
        if (
            isChartEnabled &&
            isUserOnline &&
            candleScale.isShowLatestCandle &&
            isChartOpen &&
            isChartVisible
        ) {
            if (
                candleData &&
                candleData.candles &&
                candleTimeLocal &&
                !isCandleDataNull
            ) {
                fetchFirst200Candles();
            }
        }
    }, [
        isChartEnabled,
        isUserOnline,
        isUserIdle
            ? Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS)
            : Math.floor(Date.now() / (2 * CACHE_UPDATE_FREQ_IN_MS)),
        candleScale.isShowLatestCandle,
    ]);

    // Use refs to store previous base and quote values in order to not duplicate candle fetching when pool changes
    const prevBaseRef = useRef<string | undefined>(
        userTransactionsByPool.changes.length > 0
            ? userTransactionsByPool.changes[0].base
            : undefined,
    );
    const prevQuoteRef = useRef<string | undefined>(
        userTransactionsByPool.changes.length > 0
            ? userTransactionsByPool.changes[0].quote
            : undefined,
    );

    useEffect(() => {
        if (
            prevBaseRef.current === undefined ||
            !userTransactionsByPool.changes.length
        ) {
            prevBaseRef.current = baseTokenAddress;
        }
        if (
            prevQuoteRef.current === undefined ||
            !userTransactionsByPool.changes.length
        ) {
            prevQuoteRef.current = quoteTokenAddress;
        }
    }, [baseTokenAddress, quoteTokenAddress]);

    // update latest candles when a new user transaction is indexed
    useEffect(() => {
        if (
            userTransactionsByPool.changes.length > 0 &&
            sessionReceipts.length > 0
        ) {
            // Check if base or quote has changed
            const hasBaseChanged =
                prevBaseRef.current?.toLowerCase() !==
                userTransactionsByPool.changes[0].base.toLowerCase();

            const hasQuoteChanged =
                prevQuoteRef.current?.toLowerCase() !==
                userTransactionsByPool.changes[0].quote.toLowerCase();

            if (!hasBaseChanged && !hasQuoteChanged) {
                // delay 5 seconds
                setTimeout(() => {
                    fetchFirst200Candles();
                }, 5000);
            }
            // Update refs with current values
            prevBaseRef.current = userTransactionsByPool.changes[0].base;
            prevQuoteRef.current = userTransactionsByPool.changes[0].quote;
        }
    }, [userTransactionsByPool.changes.length]);

    /**
     * only works if have not enough candle data on condensed mode
     */
    useEffect(() => {
        (async () => {
            if (crocEnv && (await crocEnv.context).chain.chainId === chainId) {
                const lastDate = new Date(
                    (candleDomains?.lastCandleDate as number) / 1000,
                ).getTime();
                fetchCandlesByNumDurations(2999, lastDate);
            }
        })();
    }, [candleDomains.isCondensedFetching]);

    useEffect(() => {
        if (isCandleDataNull) {
            const newInt = setInterval(() => {
                setCandleScale((prev) => ({
                    lastCandleDate: undefined,
                    nCandles: 200,
                    isFetchForTimeframe: !prev.isFetchForTimeframe,
                    isShowLatestCandle: true,
                    isFetchFirst200Candle: true,
                }));
            }, 10000);

            offlineFetcherRef.current = newInt;
            setOfflineFetcher(newInt);
        } else {
            clearInterval(offlineFetcherRef.current);
            offlineFetcherRef.current = undefined;
        }

        return () => {
            clearInterval(offlineFetcherRef.current);
            offlineFetcherRef.current = undefined;
        };
    }, [isCandleDataNull]);

    const fetchCandles = () => {
        if (
            isChartEnabled &&
            isServerEnabled &&
            isUserOnline &&
            baseTokenAddress &&
            quoteTokenAddress &&
            crocEnv
        ) {
            const candleTime = candleScale.isShowLatestCandle
                ? 0
                : candleScale.lastCandleDate || 0;

            const nCandles = Math.min(Math.max(candleScale?.nCandles), 2999);

            setIsFinishRequest(false);
            setTimeOfEndCandle(undefined);

            const chartSettings: chartSettingsIF | null = JSON.parse(
                getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '{}',
            );

            const defaultCandleDuration =
                chartSettings?.candleTimeGlobal || 3600;
            fetchCandleSeriesHybrid(
                true,
                chainId,
                poolIndex,
                GCGO_URL,
                candleTimeLocal || defaultCandleDuration,
                baseToken,
                quoteToken,
                candleTime,
                nCandles,
                crocEnv,
                cachedFetchTokenPrice,
                cachedQuerySpotPrice,
                poolData,
            )
                .then((candles) => {
                    if (
                        baseTokenAddressRef.current ===
                            baseTokenAddress.toLowerCase() &&
                        quoteTokenAddressRef.current ===
                            quoteTokenAddress.toLowerCase()
                    ) {
                        if (candles) {
                            setCandleData(candles);

                            const candleSeries = candles?.candles;
                            if (candleSeries && candleSeries.length > 0) {
                                if (candles?.candles.length < nCandles) {
                                    const localCandles = candles?.candles;

                                    setTimeOfEndCandle(
                                        localCandles[localCandles.length - 1]
                                            .time * 1000,
                                    );
                                }
                                setIsCandleDataNull(false);
                            } else {
                                setIsCandleDataNull(true);
                            }

                            if (candleSeries && candleSeries.length > 0) {
                                setIsFetchingCandle(false);
                            }
                            setIsFirstFetch(false);

                            return candles;
                        }
                    }
                })
                .then(() => {
                    setIsFinishRequest(true);
                });
        } else {
            setIsFetchingCandle(true);
        }
    };

    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

    const lastCandleDateInSeconds = Math.floor(
        (candleDomains?.lastCandleDate || 0) / 1000,
    );

    const minTimeMemo = useMemo(() => {
        const candleDataLength = candleData?.candles?.length;
        if (!candleDataLength) return;

        const lastDate = new Date(
            (candleDomains?.lastCandleDate as number) / 1000,
        ).getTime();

        return lastDate;
    }, [lastCandleDateInSeconds]);

    const numDurationsNeeded = useMemo(() => {
        if (candleTimeLocal === undefined) return;
        if (!minTimeMemo || !domainBoundaryInSeconds) return;
        const numDurationsForVisibleArea = Math.floor(
            (minTimeMemo - domainBoundaryInSeconds) / candleTimeLocal + 1,
        );

        const numDurations = isCondensedModeEnabled
            ? 3 * numDurationsForVisibleArea
            : 2 * numDurationsForVisibleArea;

        return numDurations;
    }, [minTimeMemo, domainBoundaryInSeconds]);

    const fetchCandlesByNumDurations = (
        numDurations: number,
        minTimeMemo: number,
    ) => {
        if (!crocEnv || !candleTimeLocal || candleData === undefined) {
            return;
        }

        fetchCandleSeriesHybrid(
            true,
            chainId,
            poolIndex,
            GCGO_URL,
            candleTimeLocal,
            baseToken,
            quoteToken,
            minTimeMemo ? minTimeMemo : 0,
            numDurations,
            crocEnv,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            poolData,
        )
            .then((incrCandles) => {
                if (incrCandles && candleData) {
                    const newCandles: CandleDataIF[] = [];
                    if (
                        incrCandles.candles.length === 0 ||
                        incrCandles.candles.length < numDurations - 1
                    ) {
                        const tempCandleData =
                            incrCandles.candles.length === 0
                                ? candleData.candles
                                : incrCandles.candles;
                        const minDate = Math.min(
                            ...tempCandleData.map((i) => i.time),
                        );
                        minDate && setTimeOfEndCandle(minDate * 1000);
                    }

                    for (
                        let index = 0;
                        index < incrCandles.candles.length;
                        index++
                    ) {
                        const messageCandle = incrCandles.candles[index];
                        const indexOfExistingCandle =
                            candleData.candles.findIndex(
                                (savedCandle) =>
                                    savedCandle.time === messageCandle.time,
                            );

                        if (indexOfExistingCandle === -1) {
                            newCandles.push(messageCandle);
                        } else {
                            candleData.candles[indexOfExistingCandle] =
                                messageCandle;
                        }
                    }

                    const newSeries = Object.assign({}, candleData, {
                        candles: candleData.candles.concat(newCandles),
                    });

                    setCandleData(newSeries);
                }
            })
            .then(() => {
                setCandleDomains((prev: CandleDomainIF) => {
                    return {
                        ...prev,
                        isResetRequest: false,
                    };
                });
            })
            .catch((e) => {
                console.error(e);

                setIsCandleDataNull(false);
            });
    };

    /**
     * only works for zoom
     */
    useEffect(() => {
        (async () => {
            if (
                numDurationsNeeded &&
                crocEnv &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                if (numDurationsNeeded > 0 && isChartOpen) {
                    minTimeMemo &&
                        fetchCandlesByNumDurations(
                            numDurationsNeeded > 2999
                                ? 2999
                                : numDurationsNeeded,
                            minTimeMemo,
                        );
                }
            }
        })();
    }, [numDurationsNeeded]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
