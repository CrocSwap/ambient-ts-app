import { CrocEnv } from '@crocswap-libs/sdk';
import {
    createContext,
    SetStateAction,
    Dispatch,
    ReactHTML,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import useDebounce from '../App/hooks/useDebounce';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../constants';
import { mktDataChainId } from '../utils/data/chains';
import { diffHashSig } from '../utils/functions/diffHashSig';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import {
    CandleData,
    CandlesByPoolAndDuration,
} from '../utils/state/graphDataSlice';
import { candleDomain, candleScale } from '../utils/state/tradeDataSlice';
import { AppStateContext } from './AppStateContext';
import { ChartContext } from './ChartContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTableContext } from './TradeTableContext';
import { TradeTokenContext } from './TradeTokenContext';

interface CandleStateIF {
    candleData: {
        value: CandlesByPoolAndDuration | undefined;
        setValue: Dispatch<
            SetStateAction<CandlesByPoolAndDuration | undefined>
        >;
    };
    isCandleDataNull: {
        value: boolean;
        setValue: Dispatch<SetStateAction<boolean>>;
    };
    isCandleSelected: {
        value: boolean | undefined;
        setValue: Dispatch<SetStateAction<boolean | undefined>>;
    };
    fetchingCandle: {
        value: boolean;
        setValue: Dispatch<SetStateAction<boolean>>;
    };
    candleDomains: {
        value: candleDomain;
        setValue: Dispatch<SetStateAction<candleDomain>>;
    };

    candleScale: {
        value: candleScale;
        setValue: Dispatch<SetStateAction<candleScale>>;
    };
    candleTimeLocal: number;
}

export const CandleContext = createContext<CandleStateIF>({} as CandleStateIF);

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
            mainnetAddress: mainnetBaseTokenAddress,
        },
        quoteToken: {
            address: quoteTokenAddress,
            mainnetAddress: mainnetQuoteTokenAddress,
        },
    } = useContext(TradeTokenContext);
    const { setExpandTradeTable } = useContext(TradeTableContext);

    const { isUserIdle } = useAppSelector((state) => state.userData);

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDuration | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();
    const [fetchingCandle, setFetchingCandle] = useState(false);
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
        if (
            location.pathname.startsWith('/trade/range') ||
            location.pathname.startsWith('/trade/reposition')
        ) {
            return chartSettings.candleTime.range.time;
        } else {
            return chartSettings.candleTime.market.time;
        }
    }, [
        chartSettings.candleTime.range.time,
        chartSettings.candleTime.market.time,
        location.pathname,
    ]);

    const candleState = {
        candleData: {
            value: candleData,
            setValue: setCandleData,
        },
        isCandleDataNull: {
            value: isCandleDataNull,
            setValue: setIsCandleDataNull,
        },
        isCandleSelected: {
            value: isCandleSelected,
            setValue: setIsCandleSelected,
        },
        fetchingCandle: {
            value: fetchingCandle,
            setValue: setFetchingCandle,
        },
        candleDomains: {
            value: candleDomains,
            setValue: setCandleDomains,
        },
        candleScale: {
            value: candleScale,
            setValue: setCandleScale,
        },
        candleTimeLocal,
    };

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
            const reqOptions = new URLSearchParams({
                base: mainnetBaseTokenAddress.toLowerCase(),
                quote: mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                period: candleTimeLocal.toString(),
                // time: '', // optional
                n: (candleScale?.nCandle > 1000
                    ? 1000
                    : candleScale?.nCandle
                ).toString(), // positive integer: max 1000
                // page: '0', // nonnegative integer
                chainId: mktDataChainId(chainData.chainId),
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
                poolStatsChainIdOverride: chainData.chainId,
                poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
            });

            if (candleScale?.lastCandleDate) {
                reqOptions.set('time', candleScale?.lastCandleDate.toString()); // optional
            }

            IS_LOCAL_ENV && console.debug('fetching new candles');
            try {
                if (GRAPHCACHE_URL) {
                    const candleSeriesCacheEndpoint =
                        GRAPHCACHE_URL + '/candle_series?';
                    setFetchingCandle(true);
                    fetch(candleSeriesCacheEndpoint + reqOptions)
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;
                            if (candles?.length === 0) {
                                setIsCandleDataNull(true);
                                setExpandTradeTable(true);
                            } else if (candles) {
                                setCandleData({
                                    pool: {
                                        baseAddress:
                                            baseTokenAddress.toLowerCase(),
                                        quoteAddress:
                                            quoteTokenAddress.toLowerCase(),
                                        poolIdx: chainData.poolIndex,
                                        network: chainData.chainId,
                                    },
                                    duration: candleTimeLocal,
                                    candles: candles,
                                });
                                setIsCandleDataNull(false);
                                setExpandTradeTable(false);
                            }
                            return candles?.length;
                        })
                        .then((result) => {
                            if (result !== 0) {
                                setFetchingCandle(false);
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
    const fetchCandlesByNumDurations = (numDurations: number) =>
        fetch(
            candleSeriesCacheEndpoint +
                new URLSearchParams({
                    base: mainnetBaseTokenAddress.toLowerCase(),
                    quote: mainnetQuoteTokenAddress.toLowerCase(),
                    poolIdx: chainData.poolIndex.toString(),
                    period: candleTimeLocal.toString(),
                    time: minTimeMemo ? minTimeMemo.toString() : '0',
                    // time: debouncedBoundary.toString(),
                    n: numDurations.toString(), // positive integer
                    // page: '0', // nonnegative integer
                    chainId: mktDataChainId(chainData.chainId),
                    dex: 'all',
                    poolStats: 'true',
                    concise: 'true',
                    poolStatsChainIdOverride: chainData.chainId,
                    poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                    poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                    poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
                }),
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
            .catch(console.error);
    useEffect(() => {
        if (!numDurationsNeeded) return;
        if (numDurationsNeeded > 0 && numDurationsNeeded < 1000) {
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded]);

    return (
        <CandleContext.Provider value={candleState}>
            {props.children}
        </CandleContext.Provider>
    );
};
