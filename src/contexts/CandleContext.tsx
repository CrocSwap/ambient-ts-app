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
import { TradeDataContext } from './TradeDataContext';
import { TradeTokenContext } from './TradeTokenContext';
import { UserDataContext } from './UserDataContext';

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
}

export const CandleContext = createContext({} as CandleContextIF);

export const CandleContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserOnline,
        isUserIdle,
    } = useContext(AppStateContext);

    const {
        chartSettings,
        isEnabled: isChartEnabled,
        isCandleDataNull,
        setIsCandleDataNull,
    } = useContext(ChartContext);
    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const { poolPriceNonDisplay: poolPriceDisplay, setPoolPriceNonDisplay } =
        useContext(TradeDataContext);
    const { isUserConnected } = useContext(UserDataContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

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
    });

    const [offlineFetcher, setOfflineFetcher] = useState<NodeJS.Timeout>();
    const offlineFetcherRef = useRef<NodeJS.Timeout>();
    offlineFetcherRef.current = offlineFetcher;

    const checkUserConnected = useRef(isUserConnected);

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
    };

    useEffect(() => {
        setIsFirstFetch(true);
    }, [isFirstFetch]);

    useEffect(() => {
        setCandleData(undefined);
        setTimeOfEndCandle(undefined);
        setIsCondensedModeEnabled(true);
        setPoolPriceNonDisplay(0);
    }, [baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        (async () => {
            const isChangeUserConnected =
                checkUserConnected.current === isUserConnected;

            if (
                crocEnv &&
                isUserOnline &&
                (await crocEnv.context).chain.chainId === chainId &&
                isChangeUserConnected &&
                poolPriceDisplay &&
                isChartEnabled
            ) {
                fetchCandles(true);
                if (isManualCandleFetchRequested)
                    setIsManualCandleFetchRequested(false);
            }
            checkUserConnected.current = isUserConnected;
        })();
    }, [
        isManualCandleFetchRequested,
        isChartEnabled,
        crocEnv,
        isUserOnline,
        baseTokenAddress + quoteTokenAddress,
        isPoolInitialized,
        chainId,
        poolPriceDisplay === 0,
        isUserConnected,
    ]);

    // only works when the period changes
    useEffect(() => {
        fetchCandles();
    }, [candleScale?.isFetchForTimeframe]);

    useEffect(() => {
        if (isChartEnabled && isUserOnline && candleScale.isShowLatestCandle) {
            if (
                candleData &&
                candleData.candles &&
                candleTimeLocal &&
                !isCandleDataNull
            ) {
                const nowTime = Math.floor(Date.now() / 1000);

                fetchCandlesByNumDurations(200, nowTime);
            }
        }
    }, [
        isChartEnabled,
        isUserOnline,
        isUserIdle
            ? Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS)
            : Math.floor(Date.now() / (2 * CACHE_UPDATE_FREQ_IN_MS)),
        baseTokenAddress + quoteTokenAddress,
        candleScale?.isFetchForTimeframe,
        // candleScale.nCandles,
        candleScale.isShowLatestCandle,
    ]);

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

    const fetchCandles = (bypassSpinner = false) => {
        if (
            isChartEnabled &&
            isServerEnabled &&
            isUserOnline &&
            baseTokenAddress &&
            quoteTokenAddress &&
            crocEnv &&
            poolPriceDisplay
        ) {
            const candleTime = candleScale.isShowLatestCandle
                ? Math.floor(Date.now() / 1000)
                : candleScale.lastCandleDate || 0;

            const nCandles = Math.min(Math.max(candleScale?.nCandles), 2999);

            setIsFinishRequest(false);
            !bypassSpinner && setIsFetchingCandle(true);
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
                baseTokenAddress,
                quoteTokenAddress,
                candleTime,
                nCandles,
                crocEnv,
                cachedFetchTokenPrice,
                cachedQuerySpotPrice,
                poolPriceDisplay,
            )
                .then((candles) => {
                    setCandleData(candles);
                    const candleSeries = candles?.candles;
                    if (candleSeries && candleSeries.length > 0) {
                        if (candles?.candles.length < nCandles) {
                            const localCandles = candles?.candles;

                            setTimeOfEndCandle(
                                localCandles[localCandles.length - 1].time *
                                    1000,
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

        return numDurations > 2999 ? 2999 : numDurations;
    }, [minTimeMemo, domainBoundaryInSeconds]);

    const fetchCandlesByNumDurations = (
        numDurations: number,
        minTimeMemo: number,
    ) => {
        if (!crocEnv || !candleTimeLocal || !poolPriceDisplay) {
            return;
        }

        fetchCandleSeriesHybrid(
            true,
            chainId,
            poolIndex,
            GCGO_URL,
            candleTimeLocal,
            baseTokenAddress,
            quoteTokenAddress,
            minTimeMemo ? minTimeMemo : 0,
            numDurations,
            crocEnv,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            poolPriceDisplay,
        )
            .then((incrCandles) => {
                if (incrCandles && candleData) {
                    if (candleDomains.isResetRequest) {
                        setCandleData(incrCandles);
                    } else {
                        const newCandles: CandleDataIF[] = [];
                        if (incrCandles.candles.length === 0) {
                            candleData.candles.sort(
                                (a: CandleDataIF, b: CandleDataIF) =>
                                    b.time - a.time,
                            );
                            setTimeOfEndCandle(
                                candleData.candles[
                                    candleData.candles.length - 1
                                ].time * 1000,
                            );
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
                }
            })
            .catch((e) => {
                console.error(e);

                setIsCandleDataNull(false);
            });
    };

    useEffect(() => {
        (async () => {
            if (
                numDurationsNeeded &&
                crocEnv &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                if (numDurationsNeeded > 0 && numDurationsNeeded < 3000) {
                    minTimeMemo &&
                        fetchCandlesByNumDurations(
                            numDurationsNeeded,
                            minTimeMemo,
                        );
                }
            }
        })();
    }, [numDurationsNeeded, minTimeMemo, crocEnv, chainId]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
