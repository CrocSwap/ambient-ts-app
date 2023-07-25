import {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import {
    CandleData,
    fetchCandleSeriesHybrid,
} from '../App/functions/fetchCandleSeries';
import useDebounce from '../App/hooks/useDebounce';
import { translateMainnetForGraphcache } from '../utils/data/testTokenMap';
import { CandlesByPoolAndDuration } from '../utils/state/graphDataSlice';
import { candleDomain, candleScale } from '../utils/state/tradeDataSlice';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import { PoolContext } from './PoolContext';

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
    timeOfEndCandle: number | undefined;
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
    const { chainData, crocEnv } = useContext(CrocEnvContext);
    const { pool: pool } = useContext(PoolContext);
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
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const [abortController, setAbortController] =
        useState<AbortController | null>(null);

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDuration | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();

    const [timeOfEndCandle, setTimeOfEndCandle] = useState<
        number | undefined
    >();

    const [isFetchingCandle, setIsFetchingCandle] = useState(false);
    const [candleDomains, setCandleDomains] = useState<candleDomain>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });

    const [candleScale, setCandleScale] = useState<candleScale>({
        lastCandleDate: undefined,
        nCandles: 200,
        isFetchForTimeframe: false,
        isShowLatestCandle: true,
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
        timeOfEndCandle,
    };

    const {
        baseToken: mainnetBaseTokenAddress,
        quoteToken: mainnetQuoteTokenAddress,
    } = translateMainnetForGraphcache(mainnetCanonBase, mainnetCanonQuote);

    useEffect(() => {
        setCandleData(undefined);
    }, [pool]);

    useEffect(() => {
        isChartEnabled && fetchCandles();
    }, [
        isChartEnabled,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        candleScale?.isFetchForTimeframe,
        candleTimeLocal,
    ]);

    useEffect(() => {
        if (isChartEnabled && candleScale.isShowLatestCandle) {
            const interval = setInterval(() => {
                fetchCandles(true);
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [
        isChartEnabled,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        candleScale?.isFetchForTimeframe,
        candleTimeLocal,
        candleScale.nCandles,
        candleScale.isShowLatestCandle,
    ]);

    const fetchCandles = (bypassSpinner = false) => {
        if (
            isServerEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            candleTimeLocal &&
            crocEnv
        ) {
            if (abortController) {
                abortController.abort();
            }
            const candleTime = candleScale.isShowLatestCandle
                ? Date.now() / 1000
                : candleScale.lastCandleDate || 0;
            const nCandles =
                candleScale?.nCandles > 3000 ? 3000 : candleScale?.nCandles;

            !bypassSpinner && setIsFetchingCandle(true);
            setTimeOfEndCandle(undefined);
            fetchCandleSeriesHybrid(
                true,
                chainData,
                candleTimeLocal,
                baseTokenAddress,
                quoteTokenAddress,
                candleTime,
                nCandles,
                crocEnv,
                cachedFetchTokenPrice,
            ).then((candles) => {
                setCandleData(candles);
                setIsCandleDataNull(false);

                const candleSeries = candles?.candles;
                if (candleSeries && candleSeries.length > 0) {
                    setIsFetchingCandle(false);
                }
            });
        } else {
            setIsCandleDataNull(true);
        }
    };

    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

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

        const lastDate = new Date(
            (candleDomains?.lastCandleDate as number) / 1000,
        ).getTime();

        return lastDate;
    }, [candleData?.candles?.length, lastCandleDateInSecondsDebounced]);

    const numDurationsNeeded = useMemo(() => {
        if (!minTimeMemo || !domainBoundaryInSeconds) return;
        const numDurations = Math.floor(
            (minTimeMemo - domainBoundaryInSeconds) / candleTimeLocal + 1,
        );

        return numDurations > 2999 ? 2999 : numDurations;
    }, [minTimeMemo, domainBoundaryInSecondsDebounced]);

    const fetchCandlesByNumDurations = (numDurations: number) => {
        const controller = new AbortController();
        setAbortController(controller);

        if (!crocEnv) {
            return;
        }

        fetchCandleSeriesHybrid(
            true,
            chainData,
            candleTimeLocal,
            baseTokenAddress,
            quoteTokenAddress,
            minTimeMemo ? minTimeMemo : 0,
            numDurations,
            crocEnv,
            cachedFetchTokenPrice,
        )
            .then((incrCandles) => {
                if (incrCandles && candleData) {
                    const newCandles: CandleData[] = [];
                    if (incrCandles.candles.length === 0) {
                        candleData.candles.sort(
                            (a: CandleData, b: CandleData) => b.time - a.time,
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
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded]);

    return (
        <CandleContext.Provider value={candleContext}>
            {props.children}
        </CandleContext.Provider>
    );
};
