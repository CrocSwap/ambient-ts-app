import {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import { fetchCandleSeriesHybrid } from '../ambient-utils/api';
import {
    CandleDataIF,
    CandleDomainIF,
    CandleScaleIF,
    CandlesByPoolAndDurationIF,
} from '../ambient-utils/types';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    LS_KEY_CHART_SETTINGS,
} from '../ambient-utils/constants';
import { getLocalStorageItem } from '../ambient-utils/dataLayer';
import { chartSettingsIF } from '../App/hooks/useChartSettings';

interface CandleContextIF {
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
}

export const CandleContext = createContext<CandleContextIF>(
    {} as CandleContextIF,
);

export const CandleContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled, isUserOnline: isUserOnline },
        isUserIdle,
    } = useContext(AppStateContext);
    const {
        chartSettings,
        isEnabled: isChartEnabled,
        isCandleDataNull,
        setIsCandleDataNull,
        setNumCandlesFetched,
    } = useContext(ChartContext);
    const { chainData, crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const [abortController] = useState<{
        abortController: AbortController | null;
    }>({ abortController: null });

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDurationIF | undefined
    >();
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();

    const [isZoomRequestCanceled, setIsZoomRequestCanceled] = useState({
        value: false,
    });

    const [timeOfEndCandle, setTimeOfEndCandle] = useState<
        number | undefined
    >();

    const [isCondensedModeEnabled, setIsCondensedModeEnabled] = useState(true);

    useEffect(() => {
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
        } else {
            // If there are no candles in the first 200 candles, it changes timeframe
            if (candleData?.candles)
                setNumCandlesFetched(candleData?.candles.length || 0);
        }
    }, [candleData?.candles.length]);

    const [isFetchingCandle, setIsFetchingCandle] = useState(false);
    const [candleDomains, setCandleDomains] = useState<CandleDomainIF>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
        isAbortedRequest: false,
    });

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
    };

    useEffect(() => {
        setCandleData(undefined);
        setTimeOfEndCandle(undefined);
        setIsCondensedModeEnabled(true);
    }, [baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        if (isFirstFetch) {
            const controller = new AbortController();
            abortController.abortController = controller;
            setIsZoomRequestCanceled({ value: false });
        }
        setIsFirstFetch(true);
    }, [isFirstFetch]);

    useEffect(() => {
        isChartEnabled && isUserOnline && fetchCandles();
        if (isManualCandleFetchRequested)
            setIsManualCandleFetchRequested(false);
    }, [
        isManualCandleFetchRequested,
        isChartEnabled,
        isUserOnline,
        baseTokenAddress + quoteTokenAddress,
        candleScale?.isFetchForTimeframe,
    ]);

    useEffect(() => {
        if (isChartEnabled && isUserOnline && candleScale.isShowLatestCandle) {
            if (
                candleData &&
                candleData.candles &&
                candleTimeLocal &&
                isCandleDataNull
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

    const fetchCandles = (bypassSpinner = false) => {
        if (
            isServerEnabled &&
            isUserOnline &&
            baseTokenAddress &&
            quoteTokenAddress &&
            crocEnv
        ) {
            setIsZoomRequestCanceled({ value: true });

            const candleTime = candleScale.isShowLatestCandle
                ? Date.now() / 1000
                : candleScale.lastCandleDate || 0;

            const nCandles = Math.min(
                Math.max(candleScale?.nCandles || 7, 7),
                2999,
            );

            !bypassSpinner && setIsFetchingCandle(true);
            setTimeOfEndCandle(undefined);

            const chartSettings: chartSettingsIF | null = JSON.parse(
                getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '{}',
            );

            const defaultCandleDuration =
                chartSettings?.candleTimeGlobal || 3600;
            fetchCandleSeriesHybrid(
                true,
                chainData,
                activeNetwork.graphCacheUrl,
                candleTimeLocal || defaultCandleDuration,
                baseTokenAddress,
                quoteTokenAddress,
                candleTime,
                nCandles,
                crocEnv,
                cachedFetchTokenPrice,
                cachedQuerySpotPrice,
            ).then((candles) => {
                setCandleData(candles);

                const candleSeries = candles?.candles;
                if (candleSeries && candleSeries.length > 0) {
                    if (candles?.candles.length < nCandles) {
                        const localCandles = candles?.candles;

                        setTimeOfEndCandle(
                            localCandles[localCandles.length - 1].time * 1000,
                        );
                    }
                    setIsCandleDataNull(false);
                } else {
                    if (candleScale?.isFetchFirst200Candle) {
                        setIsCandleDataNull(true);
                    }
                }

                if (candleSeries && candles?.candles.length >= 7) {
                    setIsFetchingCandle(false);
                }
                setIsFirstFetch(false);
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
    }, [candleData?.candles?.length, lastCandleDateInSeconds]);

    const numDurationsNeeded = useMemo(() => {
        if (candleTimeLocal === undefined) return;
        if (!minTimeMemo || !domainBoundaryInSeconds) return;
        const numDurations = Math.floor(
            (minTimeMemo - domainBoundaryInSeconds) / candleTimeLocal + 1,
        );

        return numDurations > 2999 ? 2999 : numDurations;
    }, [minTimeMemo, domainBoundaryInSeconds]);

    const fetchCandlesByNumDurations = (
        numDurations: number,
        minTimeMemo: number,
    ) => {
        if (!crocEnv || !candleTimeLocal) {
            return;
        }

        if (candleDomains?.isAbortedRequest) {
            const controller = new AbortController();
            abortController.abortController = controller;
            isZoomRequestCanceled.value = false;
        }

        const signal = abortController.abortController?.signal; // used cancel the request when the pool or timeframe changes before the zoom request end

        fetchCandleSeriesHybrid(
            true,
            chainData,
            activeNetwork.graphCacheUrl,
            candleTimeLocal,
            baseTokenAddress,
            quoteTokenAddress,
            minTimeMemo ? minTimeMemo : 0,
            numDurations,
            crocEnv,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            signal,
        )
            .then((incrCandles) => {
                if (incrCandles && candleData && !isZoomRequestCanceled.value) {
                    const newCandles: CandleDataIF[] = [];
                    if (incrCandles.candles.length === 0) {
                        candleData.candles.sort(
                            (a: CandleDataIF, b: CandleDataIF) =>
                                b.time - a.time,
                        );
                        setTimeOfEndCandle(
                            candleData.candles[candleData.candles.length - 1]
                                .time * 1000,
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
            })
            .catch((e) => {
                if (e.name === 'AbortError') {
                    console.warn('Zoom request cancelled');
                } else {
                    console.error(e);
                }
                setIsCandleDataNull(false);
            });
    };

    useEffect(() => {
        if (!numDurationsNeeded) return;
        if (numDurationsNeeded > 0 && numDurationsNeeded < 3000) {
            minTimeMemo &&
                fetchCandlesByNumDurations(numDurationsNeeded, minTimeMemo);
        }
    }, [numDurationsNeeded, minTimeMemo]);
    useEffect(() => {
        if (abortController.abortController && isZoomRequestCanceled.value) {
            abortController.abortController.abort();
        }
    }, [isZoomRequestCanceled.value]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
