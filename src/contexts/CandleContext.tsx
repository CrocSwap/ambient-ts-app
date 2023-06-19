import {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import { CandleData } from '../App/functions/fetchCandleSeries';
import useDebounce from '../App/hooks/useDebounce';
import {
    GRAPHCACHE_URL,
    IS_LOCAL_ENV,
    OVERRIDE_CANDLE_POOL_ID,
} from '../constants';
import { mktDataChainId } from '../utils/data/chains';
import { translateMainnetForGraphcache } from '../utils/data/testTokenMap';
import { diffHashSig } from '../utils/functions/diffHashSig';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { CandlesByPoolAndDuration } from '../utils/state/graphDataSlice';
import { candleDomain, candleScale } from '../utils/state/tradeDataSlice';
import { AppStateContext } from './AppStateContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';

interface CandleContextIF {
    candleData: CandlesByPoolAndDuration | undefined;
    setCandleData: Dispatch<
        SetStateAction<CandlesByPoolAndDuration | undefined>
    >;
    isCandleDataNull: boolean;
    setIsCandleDataNull: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    isFetchingCandle: boolean;
    setIsFetchingCandle: Dispatch<SetStateAction<boolean>>;
    candleDomains: candleDomain;
    setCandleDomains: Dispatch<SetStateAction<candleDomain>>;
    candleScale: candleScale;
    setCandleScale: Dispatch<SetStateAction<candleScale>>;
    candleTimeLocal: number;
}

export const CandleContext = createContext<CandleContextIF>(
    {} as CandleContextIF,
);

export const CandleContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { chartSettings, isEnabled: isChartEnabled } =
        useContext(ChartContext);
    const { chainData } = useContext(CrocEnvContext);
    const {
        baseToken: {
            address: baseTokenAddress,
            mainnetAddress: mainnetCanonBase,
        },
        quoteToken: {
            address: quoteTokenAddress,
            mainnetAddress: mainnetCanonQuote,
        },
    } = useContext(TradeTokenContext);

    const [abortController, setAbortController] =
        useState<AbortController | null>(null);
    const { isUserIdle } = useAppSelector((state) => state.userData);

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDuration | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();
    const [isFetchingCandle, setIsFetchingCandle] = useState(false);
    const [candleDomains, setCandleDomains] = useState<candleDomain>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });
    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

    const [candleScale, setCandleScale] = useState<candleScale>({
        lastCandleDate: undefined,
        nCandle: 200,
        isFetchForTimeframe: false,
    });

    // local logic to determine current chart period
    // this is situation-dependant but used in this file
    const candleTimeLocal = useMemo(() => {
        return chartSettings.candleTime.global.time;
    }, [chartSettings.candleTime.global.time, location.pathname]);

    const candleContext = {
        candleData,
        setCandleData,
        isCandleDataNull,
        setIsCandleDataNull,
        isCandleSelected,
        setIsCandleSelected,
        isFetchingCandle,
        setIsFetchingCandle,
        candleDomains,
        setCandleDomains,
        candleScale,
        setCandleScale,
        candleTimeLocal,
    };

    const {
        baseToken: mainnetBaseTokenAddress,
        quoteToken: mainnetQuoteTokenAddress,
    } = translateMainnetForGraphcache(mainnetCanonBase, mainnetCanonQuote);

    useEffect(() => {
        isChartEnabled && !isUserIdle && fetchCandles();
    }, [
        isChartEnabled,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        isUserIdle,
        candleScale?.isFetchForTimeframe,
    ]);
    const fetchCandles = () => {
        if (
            isServerEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            candleTimeLocal
        ) {
            if (abortController) {
                abortController.abort();
            }

            const reqOptions =
                chainData.chainId === '0x1'
                    ? new URLSearchParams({
                          base: mainnetBaseTokenAddress.toLowerCase(),
                          quote: mainnetQuoteTokenAddress.toLowerCase(),
                          poolIdx: (
                              OVERRIDE_CANDLE_POOL_ID || chainData.poolIndex
                          ).toString(),
                          period: candleTimeLocal.toString(),
                          n: (candleScale?.nCandle > 1000
                              ? 1000
                              : candleScale?.nCandle
                          ).toString(), // positive integer: max 1000
                          chainId: mktDataChainId(chainData.chainId),
                          dex: 'all',
                          poolStats: 'true',
                          concise: 'true',
                      })
                    : new URLSearchParams({
                          base: mainnetBaseTokenAddress.toLowerCase(),
                          quote: mainnetQuoteTokenAddress.toLowerCase(),
                          poolIdx: (
                              OVERRIDE_CANDLE_POOL_ID || chainData.poolIndex
                          ).toString(),
                          period: candleTimeLocal.toString(),
                          n: (candleScale?.nCandle > 1000
                              ? 1000
                              : candleScale?.nCandle
                          ).toString(), // positive integer: max 1000
                          chainId: mktDataChainId(chainData.chainId),
                          dex: 'all',
                          poolStats: 'true',
                          concise: 'true',
                          poolStatsChainIdOverride: chainData.chainId,
                          poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                          poolStatsQuoteOverride:
                              quoteTokenAddress.toLowerCase(),
                          poolStatsPoolIdxOverride: (
                              OVERRIDE_CANDLE_POOL_ID || chainData.poolIndex
                          ).toString(),
                      });

            if (candleScale?.lastCandleDate) {
                reqOptions.set('time', candleScale?.lastCandleDate.toString()); // optional
            }

            IS_LOCAL_ENV && console.debug('fetching new candles');
            try {
                if (GRAPHCACHE_URL) {
                    const candleSeriesCacheEndpoint =
                        GRAPHCACHE_URL + '/candle_series?';
                    setIsFetchingCandle(true);
                    fetch(candleSeriesCacheEndpoint + reqOptions)
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;
                            if (candles?.length === 0) {
                                setIsCandleDataNull(true);
                                // Removing due to design decision to not change trade table size without user input
                                // setExpandTradeTable(true);
                            } else if (candles) {
                                setCandleData({
                                    pool: {
                                        baseAddress:
                                            baseTokenAddress.toLowerCase(),
                                        quoteAddress:
                                            quoteTokenAddress.toLowerCase(),
                                        poolIdx: chainData.poolIndex,
                                        chainId: chainData.chainId,
                                    },
                                    duration: candleTimeLocal,
                                    candles: candles,
                                });
                                setIsCandleDataNull(false);
                                // setExpandTradeTable(false);
                            }
                            return candles?.length;
                        })
                        .then((result) => {
                            if (result !== 0) {
                                setIsFetchingCandle(false);
                            }
                        })
                        .catch(console.error);
                }
            } catch (error) {
                console.error({ error });
            }
        } else {
            setIsCandleDataNull(true);
            // setExpandTradeTable(true);
        }
    };
    const domainBoundaryInSecondsDebounced = useDebounce(
        domainBoundaryInSeconds,
        500,
    );

    const lastCandleDateInSeconds = Math.floor(
        (candleDomains?.lastCandleDate || 0) / 1000,
    );

    const lastCandleDateInSecondsDebounced = useDebounce(
        lastCandleDateInSeconds,
        500,
    );

    const minTimeMemo = useMemo(() => {
        const candleDataLength = candleData?.candles?.length;
        if (!candleDataLength) return;
        // IS_LOCAL_ENV && console.debug({ candleDataLength });

        const lastDate = new Date(
            (candleDomains?.lastCandleDate as number) / 1000,
        ).getTime();

        return lastDate;
    }, [candleData?.candles?.length, lastCandleDateInSecondsDebounced]);

    const numDurationsNeeded = useMemo(() => {
        if (!minTimeMemo || !domainBoundaryInSecondsDebounced) return;
        return Math.floor(
            (minTimeMemo - domainBoundaryInSecondsDebounced) / candleTimeLocal,
        );
    }, [minTimeMemo, domainBoundaryInSecondsDebounced]);
    const candleSeriesCacheEndpoint = GRAPHCACHE_URL + '/candle_series?';

    function capNumDurations(numDurations: number): string {
        const MAX_NUM_DURATIONS = 5000;
        const MIN_NUM_DURATIONS = 1;
        if (numDurations > MAX_NUM_DURATIONS) {
            console.warn(`Candle fetch n=${numDurations} exceeds max cap.`);
            return MAX_NUM_DURATIONS.toString();
        } else if (numDurations < MIN_NUM_DURATIONS) {
            console.warn(`Candle fetch n=${numDurations} non-positive.`);
            return MIN_NUM_DURATIONS.toString();
        }
        return numDurations.toString();
    }

    const fetchCandlesByNumDurations = (numDurations: number) => {
        const controller = new AbortController();
        setAbortController(controller);
        const signal = controller.signal;

        return fetch(
            candleSeriesCacheEndpoint +
                new URLSearchParams({
                    base: mainnetBaseTokenAddress.toLowerCase(),
                    quote: mainnetQuoteTokenAddress.toLowerCase(),
                    poolIdx: (
                        OVERRIDE_CANDLE_POOL_ID || chainData.poolIndex
                    ).toString(),
                    period: candleTimeLocal.toString(),
                    time: minTimeMemo ? minTimeMemo.toString() : '0',
                    // time: debouncedBoundary.toString(),
                    n: capNumDurations(numDurations),
                    // page: '0', // nonnegative integer
                    chainId: mktDataChainId(chainData.chainId),
                    dex: 'all',
                    poolStats: 'true',
                    concise: 'true',
                    poolStatsChainIdOverride: chainData.chainId,
                    poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                    poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                    poolStatsPoolIdxOverride: (
                        OVERRIDE_CANDLE_POOL_ID || chainData.poolIndex
                    ).toString(),
                }),
            { signal },
        )
            .then((response) => response?.json())
            .then((json) => {
                const fetchedCandles = json?.data;
                if (fetchedCandles && candleData) {
                    const newCandles: CandleData[] = [];
                    const updatedCandles: CandleData[] = candleData.candles;

                    for (
                        let index = 0;
                        index < fetchedCandles.length;
                        index++
                    ) {
                        const messageCandle = fetchedCandles[index];
                        const indexOfExistingCandle =
                            candleData.candles.findIndex(
                                (savedCandle) =>
                                    savedCandle.time === messageCandle.time,
                            );

                        if (indexOfExistingCandle === -1) {
                            newCandles.push(messageCandle);
                        } else if (
                            diffHashSig(
                                candleData.candles[indexOfExistingCandle],
                            ) !== diffHashSig(messageCandle)
                        ) {
                            updatedCandles[indexOfExistingCandle] =
                                messageCandle;
                        }
                    }

                    const newCandleData: CandlesByPoolAndDuration = {
                        pool: candleData.pool,

                        duration: candleData.duration,

                        candles: newCandles.concat(updatedCandles),
                    };
                    setCandleData(newCandleData);
                }
            })
            .catch((e) => {
                if (e.name === 'AbortError') {
                    console.warn('Zoom request cancelled');
                } else {
                    console.error(e);
                }
                setIsCandleDataNull(false);
                // setExpandTradeTable(false);
            });
    };
    useEffect(() => {
        if (!numDurationsNeeded) return;
        if (numDurationsNeeded > 0 && numDurationsNeeded < 1000) {
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
