import { ChainSpec, CrocEnv, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { GRAPHCACHE_SMALL_URL, ZERO_ADDRESS } from '../../constants';
import { testTokenMap } from '../../utils/data/testTokenMap';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../../utils/interfaces/LimitOrderIF';
import {
    PositionIF,
    PositionServerIF,
} from '../../utils/interfaces/PositionIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import {
    setChangesByPool,
    setDataLoadingStatus,
    setLeaderboardByPool,
    setLimitOrdersByPool,
    setLiquidity,
    setLiquidityPending,
    setPoolTvlSeries,
    setPoolVolumeSeries,
    setPositionsByPool,
} from '../../utils/state/graphDataSlice';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setLiquidityFee,
} from '../../utils/state/tradeDataSlice';
import { fetchPoolRecentChanges } from '../functions/fetchPoolRecentChanges';
import { getLimitOrderData } from '../functions/getLimitOrderData';
import { getLiquidityFee } from '../functions/getLiquidityFee';
import {
    poolLiquidityCacheEndpoint,
    PoolLiquidityFn,
} from '../functions/getPoolLiquidity';
import { getPositionData } from '../functions/getPositionData';
import { getTvlSeries } from '../functions/getTvlSeries';
import { getVolumeSeries } from '../functions/getVolumeSeries';

interface PoolParamsHookIF {
    crocEnv?: CrocEnv;
    httpGraphCacheServerDomain: string;
    pathname: string;
    chainData: ChainSpec;
    searchableTokens: TokenIF[];
    receiptCount: number;
    lastBlockNumber: number;
    isServerEnabled: boolean;
    isChartEnabled: boolean;
    cachedPoolLiquidity: PoolLiquidityFn;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

// Hooks to update metadata and volume/TVL/liquidity curves on a per-pool basis
export function usePoolMetadata(props: PoolParamsHookIF) {
    const dispatch = useAppDispatch();
    const tradeData = useAppSelector((state) => state.tradeData);

    const LIQUIDITY_FETCH_PERIOD_MS = 30000; // Call (and cache) fetchLiquidity every N milliseconds

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [mainnetBaseTokenAddress, setMainnetBaseTokenAddress] =
        useState<string>('');
    const [mainnetQuoteTokenAddress, setMainnetQuoteTokenAddress] =
        useState<string>('');

    const [isTokenABase, setIsTokenABase] = useState<boolean>(false);

    const ticksInParams =
        props.pathname.includes('lowTick') &&
        props.pathname.includes('highTick');

    // hook to sync token addresses in RTK to token addresses in RTK
    const rtkMatchesParams = useMemo(() => {
        let matching = false;
        const rtkTokenA = tradeData.tokenA.address;
        const rtkTokenB = tradeData.tokenB.address;
        const { pathname } = location;
        if (pathname.includes('tokenA') && pathname.includes('tokenB')) {
            const getAddrFromParams = (token: string) => {
                const idx = pathname.indexOf(token);
                const address = pathname.substring(idx + 7, idx + 49);
                return address;
            };
            const addrTokenA = getAddrFromParams('tokenA');
            const addrTokenB = getAddrFromParams('tokenB');
            if (
                addrTokenA.toLowerCase() === rtkTokenA.toLowerCase() &&
                addrTokenB.toLowerCase() === rtkTokenB.toLowerCase()
            ) {
                matching = true;
            }
        }
        return matching;
    }, [
        props.pathname,
        tradeData.tokenA.address,
        tradeData.tokenA.chainId,
        tradeData.tokenB.address,
        tradeData.tokenB.chainId,
    ]);

    // Sets up the asynchronous queries to TVL, volume and liquidity curve and translates
    // to equivalent mainnet tokens so the chart renders mainnet data even in testnet
    useEffect(() => {
        if (rtkMatchesParams && props.crocEnv) {
            if (!ticksInParams) {
                dispatch(setAdvancedLowTick(0));
                dispatch(setAdvancedHighTick(0));
                dispatch(setAdvancedMode(false));
                props.setSimpleRangeWidth(10);
            }

            const tokenAAddress = tradeData.tokenA.address;
            const tokenBAddress = tradeData.tokenB.address;

            if (tokenAAddress && tokenBAddress) {
                const sortedTokens = sortBaseQuoteTokens(
                    tokenAAddress,
                    tokenBAddress,
                );
                const tokenAMainnetEquivalent =
                    tokenAAddress === ZERO_ADDRESS
                        ? tokenAAddress
                        : testTokenMap
                              .get(
                                  tokenAAddress.toLowerCase() +
                                      '_' +
                                      props.chainData.chainId,
                              )
                              ?.split('_')[0];
                const tokenBMainnetEquivalent =
                    tokenBAddress === ZERO_ADDRESS
                        ? tokenBAddress
                        : testTokenMap
                              .get(
                                  tokenBAddress.toLowerCase() +
                                      '_' +
                                      props.chainData.chainId,
                              )
                              ?.split('_')[0];

                if (tokenAMainnetEquivalent && tokenBMainnetEquivalent) {
                    const sortedMainnetTokens = sortBaseQuoteTokens(
                        tokenAMainnetEquivalent,
                        tokenBMainnetEquivalent,
                    );

                    setMainnetBaseTokenAddress(sortedMainnetTokens[0]);
                    setMainnetQuoteTokenAddress(sortedMainnetTokens[1]);
                } else {
                    setMainnetBaseTokenAddress('');
                    setMainnetQuoteTokenAddress('');
                }

                setBaseTokenAddress(sortedTokens[0]);
                setQuoteTokenAddress(sortedTokens[1]);
                if (tradeData.tokenA.address === sortedTokens[0]) {
                    setIsTokenABase(true);
                    setBaseTokenDecimals(tradeData.tokenA.decimals);
                    setQuoteTokenDecimals(tradeData.tokenB.decimals);
                } else {
                    setIsTokenABase(false);
                    setBaseTokenDecimals(tradeData.tokenB.decimals);
                    setQuoteTokenDecimals(tradeData.tokenA.decimals);
                }

                // retrieve pool liquidity provider fee
                if (props.isServerEnabled && props.httpGraphCacheServerDomain) {
                    getLiquidityFee(
                        sortedTokens[0],
                        sortedTokens[1],
                        props.chainData.poolIndex,
                        props.chainData.chainId,
                    )
                        .then((liquidityFeeNum) => {
                            if (liquidityFeeNum)
                                dispatch(setLiquidityFee(liquidityFeeNum));
                        })
                        .catch(console.error);

                    // retrieve pool TVL series
                    getTvlSeries(
                        sortedTokens[0],
                        sortedTokens[1],
                        props.chainData.poolIndex,
                        props.chainData.chainId,
                        600, // 10 minute resolution
                    )
                        .then((tvlSeries) => {
                            if (
                                tvlSeries &&
                                tvlSeries.base &&
                                tvlSeries.quote &&
                                tvlSeries.poolIdx &&
                                tvlSeries.seriesData
                            )
                                dispatch(
                                    setPoolTvlSeries({
                                        dataReceived: true,
                                        pools: [
                                            {
                                                dataReceived: true,
                                                pool: {
                                                    base: tvlSeries.base,
                                                    quote: tvlSeries.quote,
                                                    poolIdx: tvlSeries.poolIdx,
                                                    chainId:
                                                        props.chainData.chainId,
                                                },
                                                tvlData: tvlSeries,
                                            },
                                        ],
                                    }),
                                );
                        })
                        .catch(console.error);

                    // retrieve pool volume series
                    getVolumeSeries(
                        sortedTokens[0],
                        sortedTokens[1],
                        props.chainData.poolIndex,
                        props.chainData.chainId,
                        600, // 10 minute resolution
                    )
                        .then((volumeSeries) => {
                            if (
                                volumeSeries &&
                                volumeSeries.base &&
                                volumeSeries.quote &&
                                volumeSeries.poolIdx &&
                                volumeSeries.seriesData
                            )
                                dispatch(
                                    setPoolVolumeSeries({
                                        dataReceived: true,
                                        pools: [
                                            {
                                                dataReceived: true,
                                                pool: {
                                                    base: volumeSeries.base,
                                                    quote: volumeSeries.quote,
                                                    poolIdx:
                                                        volumeSeries.poolIdx,
                                                    chainId:
                                                        props.chainData.chainId,
                                                },
                                                volumeData: volumeSeries,
                                            },
                                        ],
                                    }),
                                );
                        })
                        .catch(console.error);

                    // retrieve pool_positions
                    const allPositionsCacheEndpoint =
                        GRAPHCACHE_SMALL_URL + '/pool_positions?';
                    fetch(
                        allPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: props.chainData.poolIndex.toString(),
                                chainId: props.chainData.chainId,
                                annotate: 'true', // token quantities
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                omitKnockout: 'true',
                                addValue: 'true',
                                n: '50',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const poolPositions = json.data;
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'poolRangeData',
                                    loadingStatus: false,
                                }),
                            );

                            const crocEnv = props.crocEnv;
                            if (poolPositions && crocEnv) {
                                Promise.all(
                                    poolPositions.map(
                                        (position: PositionServerIF) => {
                                            return getPositionData(
                                                position,
                                                props.searchableTokens,
                                                crocEnv,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        dispatch(
                                            setPositionsByPool({
                                                dataReceived: true,
                                                positions: updatedPositions,
                                            }),
                                        );
                                    })
                                    .catch(console.error);
                            } else {
                                dispatch(
                                    setPositionsByPool({
                                        dataReceived: false,
                                        positions: [],
                                    }),
                                );
                            }
                        })
                        .catch(console.error);

                    // retrieve positions for leaderboard
                    const poolPositionsCacheEndpoint =
                        GRAPHCACHE_SMALL_URL + '/pool_position_apy_leaders?';
                    fetch(
                        poolPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: props.chainData.poolIndex.toString(),
                                chainId: props.chainData.chainId,
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                omitKnockout: 'true',
                                addValue: 'true',
                                sortByAPY: 'true',
                                n: '50',
                                minPosAge: '86400', // restrict leaderboard to position > 1 day old
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const leaderboardPositions = json.data;

                            const crocEnv = props.crocEnv;
                            if (leaderboardPositions && crocEnv) {
                                Promise.all(
                                    leaderboardPositions.map(
                                        (position: PositionServerIF) => {
                                            return getPositionData(
                                                position,
                                                props.searchableTokens,
                                                crocEnv,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        const top10Positions = updatedPositions
                                            .filter(
                                                (
                                                    updatedPosition: PositionIF,
                                                ) => {
                                                    return (
                                                        updatedPosition.isPositionInRange &&
                                                        updatedPosition.apy !==
                                                            0
                                                    );
                                                },
                                            )
                                            .slice(0, 10);

                                        dispatch(
                                            setLeaderboardByPool({
                                                dataReceived: true,
                                                positions: top10Positions,
                                            }),
                                        );
                                    })
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    // retrieve pool recent changes
                    fetchPoolRecentChanges({
                        tokenList: props.searchableTokens,
                        base: sortedTokens[0],
                        quote: sortedTokens[1],
                        poolIdx: props.chainData.poolIndex,
                        chainId: props.chainData.chainId,
                        annotate: true,
                        addValue: true,
                        simpleCalc: true,
                        annotateMEV: false,
                        ensResolution: true,
                        n: 80,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolTxData',
                                        loadingStatus: false,
                                    }),
                                );
                                dispatch(
                                    setChangesByPool({
                                        dataReceived: true,
                                        changes: poolChangesJsonData,
                                    }),
                                );
                            }
                        })
                        .catch(console.error);

                    // retrieve pool limit order states
                    const poolLimitOrderStatesCacheEndpoint =
                        GRAPHCACHE_SMALL_URL + '/pool_limit_orders?';

                    fetch(
                        poolLimitOrderStatesCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: props.chainData.poolIndex.toString(),
                                chainId: props.chainData.chainId,
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                n: '50',
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLimitOrderStates = json?.data;

                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'poolOrderData',
                                    loadingStatus: false,
                                }),
                            );

                            const crocEnv = props.crocEnv;
                            if (poolLimitOrderStates && crocEnv) {
                                Promise.all(
                                    poolLimitOrderStates.map(
                                        (limitOrder: LimitOrderServerIF) => {
                                            return getLimitOrderData(
                                                limitOrder,
                                                props.searchableTokens,
                                                crocEnv,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                            );
                                        },
                                    ),
                                ).then((updatedLimitOrderStates) => {
                                    dispatch(
                                        setLimitOrdersByPool({
                                            dataReceived: true,
                                            limitOrders:
                                                updatedLimitOrderStates,
                                        }),
                                    );
                                });
                            }
                        })
                        .catch(console.error);
                }
            }
        }
    }, [
        props.receiptCount,
        rtkMatchesParams,
        tradeData.tokenA.address,
        tradeData.tokenB.address,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.searchableTokens,
        props.httpGraphCacheServerDomain,
        props.lastBlockNumber == 0,
        !!props.crocEnv,
    ]);

    // Makes a query to the backend with a client-side cache
    const fetchLiquidity = async () => {
        if (
            !baseTokenAddress ||
            !quoteTokenAddress ||
            !props.chainData ||
            !props.lastBlockNumber
        )
            return;

        props
            .cachedPoolLiquidity(
                props.chainData.chainId,
                baseTokenAddress.toLowerCase(),
                quoteTokenAddress.toLowerCase(),
                props.chainData.poolIndex,
                Math.floor(Date.now() / LIQUIDITY_FETCH_PERIOD_MS),
            )
            .then((jsonData) => {
                dispatch(setLiquidity(jsonData));
            })
            .catch(console.error);
    };

    // Updates liquidity curve on the fetch period
    useEffect(() => {
        if (
            !props.isChartEnabled ||
            !baseTokenAddress ||
            !quoteTokenAddress ||
            !props.chainData ||
            !props.lastBlockNumber
        )
            return;
        const id = setInterval(() => {
            fetchLiquidity();
        }, LIQUIDITY_FETCH_PERIOD_MS);
        return () => clearInterval(id);
    }, [
        baseTokenAddress,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.lastBlockNumber === 0,
        props.isChartEnabled,
    ]);

    // Makes asychronous call to the liquidity curve
    useEffect(() => {
        if (
            !baseTokenAddress ||
            !quoteTokenAddress ||
            !props.chainData ||
            !props.lastBlockNumber
        )
            return;

        // Reset existing liquidity data until the fetch completes, because it's a new pool
        const request = {
            baseAddress: baseTokenAddress,
            quoteAddress: quoteTokenAddress,
            chainId: props.chainData.chainId,
            poolIndex: props.chainData.poolIndex,
        };

        // Set the pending data before making the request
        dispatch(setLiquidityPending(request));

        fetch(
            poolLiquidityCacheEndpoint +
                new URLSearchParams({
                    chainId: props.chainData.chainId,
                    base: baseTokenAddress,
                    quote: quoteTokenAddress,
                    poolIdx: props.chainData.poolIndex.toString(),
                    concise: 'true',
                    latestTick: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                dispatch(setLiquidity(json.data));
            })
            .catch(console.error);
    }, [
        baseTokenAddress,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.lastBlockNumber == 0,
    ]);

    // On transaction receipt (e.g. a swap is confirmed), refresh the liquidity curve
    // with a short delay to let the backend sync to the RPC
    useEffect(() => {
        if (
            !baseTokenAddress ||
            !quoteTokenAddress ||
            !props.chainData ||
            !props.lastBlockNumber
        )
            return;

        const REFRESH_DELAY_MS = 2000;
        const timer1 = setTimeout(() => {
            fetch(
                poolLiquidityCacheEndpoint +
                    new URLSearchParams({
                        chainId: props.chainData.chainId,
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: props.chainData.poolIndex.toString(),
                        concise: 'true',
                        latestTick: 'true',
                    }),
            )
                .then((response) => response.json())
                .then((json) => {
                    dispatch(setLiquidity(json.data));
                })
                .catch(console.error);
        }, REFRESH_DELAY_MS);
        return () => {
            clearTimeout(timer1);
        };
    }, [props.receiptCount]);

    return {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals, // Token contract decimals
        quoteTokenDecimals, // Token contract decimals
        mainnetBaseTokenAddress, // The mainnet equivalent base token (if testnet)
        mainnetQuoteTokenAddress, // The mainnet euquivalent quote token
        isTokenABase, // True if the base token is the first token in the panel (e.g. sell token on swap)
    };
}
