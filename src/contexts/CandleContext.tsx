import {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
    useCallback,
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
import { CACHE_UPDATE_FREQ_IN_MS } from '../ambient-utils/constants';

interface CandleContextIF {
    candleData: CandlesByPoolAndDurationIF | undefined;
    setCandleData: Dispatch<
        SetStateAction<CandlesByPoolAndDurationIF | undefined>
    >;
    isCandleDataNull: boolean;
    setIsCandleDataNull: Dispatch<SetStateAction<boolean>>;
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
    candleTimeLocal: number;
    timeOfEndCandle: number | undefined;
}

export const CandleContext = createContext<CandleContextIF>(
    {} as CandleContextIF,
);

export const CandleContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled, isUserOnline: isUserOnline },
    } = useContext(AppStateContext);
    const { chartSettings, isEnabled: isChartEnabled } =
        useContext(ChartContext);
    const { chainData, crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const [abortController, setAbortController] =
        useState<AbortController | null>(null);

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDurationIF | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();

    const [isZoomRequestCanceled, setIsZoomRequestCanceled] = useState(false);

    const [timeOfEndCandle, setTimeOfEndCandle] = useState<
        number | undefined
    >();

    const [isFetchingCandle, setIsFetchingCandle] = useState(false);
    const [candleDomains, setCandleDomains] = useState<CandleDomainIF>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });

    const [candleScale, setCandleScale] = useState<CandleScaleIF>({
        lastCandleDate: undefined,
        nCandles: 200,
        isFetchForTimeframe: false,
        isShowLatestCandle: true,
    });

    // local logic to determine current chart period
    // this is situation-dependant but used in this file
    const candleTimeLocal = useMemo(() => {
        return chartSettings.candleTime.global.time;
    }, [chartSettings.candleTime.global.time]);

    const [isManualCandleFetchRequested, setIsManualCandleFetchRequested] =
        useState(false);

    const candleContext = {
        candleData,
        setCandleData,
        isCandleDataNull,
        setIsCandleDataNull,
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
    };

    // TODO: move into ambient-utils
    const fetchCandles = useCallback(
        (bypassSpinner = false) => {
            if (
                isServerEnabled &&
                isUserOnline &&
                baseTokenAddress &&
                quoteTokenAddress &&
                candleTimeLocal &&
                crocEnv
            ) {
                setIsZoomRequestCanceled(true);

                const candleTime = candleScale.isShowLatestCandle
                    ? Date.now() / 1000
                    : candleScale.lastCandleDate || 0;
                const nCandles =
                    candleScale?.nCandles > 2999 ? 2999 : candleScale?.nCandles;

                !bypassSpinner && setIsFetchingCandle(true);
                setTimeOfEndCandle(undefined);
                fetchCandleSeriesHybrid(
                    true,
                    chainData,
                    activeNetwork.graphCacheUrl,
                    candleTimeLocal,
                    baseTokenAddress,
                    quoteTokenAddress,
                    candleTime,
                    nCandles,
                    crocEnv,
                    cachedFetchTokenPrice,
                ).then((candles) => {
                    setCandleData(candles);

                    const candleSeries = candles?.candles;
                    if (candleSeries && candleSeries.length > 0) {
                        setIsCandleDataNull(false);
                    } else {
                        setIsCandleDataNull(true);
                    }
                    setIsFetchingCandle(false);
                });
            } else {
                setIsFetchingCandle(true);
            }
        },
        [
            activeNetwork.graphCacheUrl,
            baseTokenAddress,
            cachedFetchTokenPrice,
            candleScale.isShowLatestCandle,
            candleScale.lastCandleDate,
            candleScale?.nCandles,
            candleTimeLocal,
            chainData,
            crocEnv,
            isServerEnabled,
            isUserOnline,
            quoteTokenAddress,
        ],
    );

    useEffect(() => {
        console.log('candledatacontext 1');
        setCandleData(undefined);
    }, [baseTokenAddress, quoteTokenAddress, candleTimeLocal]);

    useEffect(() => {
        console.log('candledatacontext 2');
        isChartEnabled && isUserOnline && fetchCandles();
        setIsManualCandleFetchRequested((isManualCandleFetchRequested) => {
            if (isManualCandleFetchRequested) {
                return false;
            } else {
                return isManualCandleFetchRequested;
            }
        });
    }, [
        isChartEnabled,
        isUserOnline,
        candleScale.isFetchForTimeframe,
        fetchCandles,
    ]);

    useEffect(() => {
        console.log('candledatacontext 3');
        if (isChartEnabled && isUserOnline && candleScale.isShowLatestCandle) {
            const interval = setInterval(() => {
                fetchCandles(true);
            }, CACHE_UPDATE_FREQ_IN_MS);
            return () => clearInterval(interval);
        }
    }, [
        isChartEnabled,
        isUserOnline,
        candleScale.isFetchForTimeframe,
        candleScale.nCandles,
        candleScale.isShowLatestCandle,
        fetchCandles,
    ]);

    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

    const minTimeMemo = useMemo(() => {
        const candleDataLength = candleData?.candles?.length;
        if (!candleDataLength) return;

        const lastDate = new Date(
            (candleDomains?.lastCandleDate as number) / 1000,
        ).getTime();

        return lastDate;
    }, [candleData?.candles?.length, candleDomains?.lastCandleDate]);

    const numDurationsNeeded = useMemo(() => {
        if (!minTimeMemo || !domainBoundaryInSeconds) return;
        const numDurations = Math.floor(
            (minTimeMemo - domainBoundaryInSeconds) / candleTimeLocal + 1,
        );

        return numDurations > 2999 ? 2999 : numDurations;
    }, [minTimeMemo, domainBoundaryInSeconds, candleTimeLocal]);

    const fetchCandlesByNumDurations = useCallback(
        (numDurations: number) => {
            if (!crocEnv) {
                return;
            }

            const controller = new AbortController();
            setAbortController(controller);

            const signal = controller?.signal; // used cancel the request when the pool or timeframe changes before the zoom request end

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
                signal,
            )
                .then((incrCandles) => {
                    if (incrCandles && candleData && !isZoomRequestCanceled) {
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
                    } else {
                        setIsZoomRequestCanceled(false);
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
        },
        [
            activeNetwork.graphCacheUrl,
            baseTokenAddress,
            cachedFetchTokenPrice,
            candleData,
            candleTimeLocal,
            chainData,
            crocEnv,
            isZoomRequestCanceled,
            minTimeMemo,
            quoteTokenAddress,
        ],
    );

    useEffect(() => {
        console.log('candledatacontext 4');
        if (!numDurationsNeeded) return;
        if (numDurationsNeeded > 0 && numDurationsNeeded < 3000) {
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded, isZoomRequestCanceled, fetchCandlesByNumDurations]);

    useEffect(() => {
        console.log('candledatacontext 5');
        if (abortController && isZoomRequestCanceled) {
            abortController.abort();
        }
    }, [abortController, isZoomRequestCanceled]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
