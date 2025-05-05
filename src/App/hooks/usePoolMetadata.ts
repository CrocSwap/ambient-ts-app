import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
    expandLiquidityData,
    fetchPoolLiquidity,
    fetchPoolRecentChanges,
    LiquidityCurveServerIF,
} from '../../ambient-utils/api';
import { fetchPoolLimitOrders } from '../../ambient-utils/api/fetchPoolLimitOrders';
import {
    filterLimitArray,
    getLimitOrderData,
    getPositionData,
    getTransactionData,
} from '../../ambient-utils/dataLayer';
import {
    LimitOrderIF,
    LimitOrderServerIF,
    PoolIF,
    PositionIF,
    PositionServerIF,
    TransactionIF,
    TransactionServerIF,
} from '../../ambient-utils/types';
import {
    CachedDataContext,
    ChainDataContext,
    CrocEnvContext,
    ReceiptContext,
    TokenContext,
    UserDataContext,
} from '../../contexts';
import { AppStateContext } from '../../contexts/AppStateContext';
import { DataLoadingContext } from '../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../contexts/GraphDataContext';
import { RangeContext } from '../../contexts/RangeContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import useMediaQuery from '../../utils/hooks/useMediaQuery';

// Hooks to update metadata and volume/TVL/liquidity curves on a per-pool basis
export function usePoolMetadata() {
    const { setDataLoadingStatus } = useContext(DataLoadingContext);

    const { tokens } = useContext(TokenContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { sessionReceipts } = useContext(ReceiptContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        isUserIdle,
        isUserOnline,
        activeNetwork: { chainId, poolIndex, GCGO_URL, isTestnet },
        isTradeRoute,
    } = useContext(AppStateContext);
    const {
        setAdvancedLowTick,
        setAdvancedHighTick,
        setAdvancedMode,
        setSimpleRangeWidth,
    } = useContext(RangeContext);
    const {
        setUserPositionsByPool,
        setUserTransactionsByPool,
        setPositionsByPool,
        setTransactionsByPool,
        setLimitOrdersByPool,
        setUserLimitOrdersByPool,
        setLiquidity,
        setLiquidityFee,
        positionsByPool,
        limitOrdersByPool,
    } = useContext(GraphDataContext);

    const { blockPollingUrl, activePoolList } = useContext(ChainDataContext);

    const {
        tokenA,
        tokenB,
        defaultRangeWidthForActivePool,
        currentPoolPriceTick,
        activeTab,
        contextMatchesParams,
    } = useContext(TradeDataContext);

    const {
        cachedQuerySpotPrice,
        cachedQuerySpotTick,
        cachedFetchTokenPrice,
        cachedTokenDetails,
    } = useContext(CachedDataContext);

    const pathname = useLocation().pathname;

    const isMobile = useMediaQuery('(max-width: 500px)');

    const [isChartOpenOnMobile, setIsChartOpenOnMobile] = useState(false);

    useEffect(() => {
        if (isMobile && activeTab === 'Chart') {
            setIsChartOpenOnMobile(true);
        } else {
            setIsChartOpenOnMobile(false);
        }
    }, [isMobile && activeTab]);

    const isChartVisible =
        isChartOpenOnMobile || (!isMobile && pathname.includes('/trade'));

    const ticksInParams =
        pathname.includes('lowTick') && pathname.includes('highTick');

    const baseTokenAddress = useMemo(
        () => sortBaseQuoteTokens(tokenA.address, tokenB.address)[0],
        [tokenA, tokenB],
    );

    const quoteTokenAddress = useMemo(
        () => sortBaseQuoteTokens(tokenA.address, tokenB.address)[1],
        [tokenA, tokenB],
    );

    const baseTokenDecimals = useMemo(
        () =>
            tokenA.address ===
            sortBaseQuoteTokens(tokenA.address, tokenB.address)[0]
                ? tokenA.decimals
                : tokenB.decimals,
        [tokenA, tokenB],
    );

    const quoteTokenDecimals = useMemo(
        () =>
            tokenA.address ===
            sortBaseQuoteTokens(tokenA.address, tokenB.address)[0]
                ? tokenB.decimals
                : tokenA.decimals,
        [tokenA, tokenB],
    );

    // Token and range housekeeping when switching pairs
    useEffect(() => {
        if (contextMatchesParams && tokenA.address && tokenB.address) {
            if (!ticksInParams) {
                setAdvancedLowTick(0);
                setAdvancedHighTick(0);
                setAdvancedMode(false);
                setSimpleRangeWidth(defaultRangeWidthForActivePool);
            }
        }
    }, [contextMatchesParams, tokenA.address + tokenB.address, ticksInParams]);

    const [newTxByPoolData, setNewTxByPoolData] = useState<
        TransactionIF[] | undefined
    >([]);

    const [newLimitsByPoolData, setNewLimitsByPoolData] = useState<
        LimitOrderIF[] | undefined
    >([]);

    const [newRangesByPoolData, setNewRangesByPoolData] = useState<
        PositionIF[] | undefined
    >([]);

    useEffect(() => {
        // reset new data when switching pairs
        setNewTxByPoolData(undefined);
        setNewLimitsByPoolData(undefined);
        setNewRangesByPoolData(undefined);
    }, [baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        if (newTxByPoolData) {
            const filteredNewTxByPoolData = newTxByPoolData.filter((tx) => {
                return (
                    tx.base.toLowerCase() === baseTokenAddress.toLowerCase() &&
                    tx.quote.toLowerCase() === quoteTokenAddress.toLowerCase()
                );
            });
            if (filteredNewTxByPoolData.length > 0) {
                setTransactionsByPool((prev) => {
                    // Create a Set of existing transaction identifiers (e.g., txHash or txId)
                    const existingTxIds = new Set(
                        prev.changes.map(
                            (change) => change.txHash || change.txId,
                        ),
                    );
                    // Filter out transactions that are already in the state
                    const newUniqueTxByPoolData =
                        filteredNewTxByPoolData.filter(
                            (tx) => !existingTxIds.has(tx.txHash || tx.txId),
                        );
                    // Sort and remove the oldest transactions if necessary
                    const prevChangesCopy = [...prev.changes]; // Create a copy to avoid mutating state directly

                    // splite action disabled for infinite scroll, was triggering redundant page skip issue
                    // if (newUniqueTxByPoolData.length > 0) {
                    //     prevChangesCopy.sort((a, b) => a.txTime - b.txTime);
                    //     prevChangesCopy.splice(0, newUniqueTxByPoolData.length);
                    // }

                    const newTxsArray = [
                        ...prevChangesCopy,
                        ...newUniqueTxByPoolData,
                    ];

                    return {
                        dataReceived: true,
                        changes: newTxsArray,
                    };
                });
                setDataLoadingStatus({
                    datasetName: 'isPoolTxDataLoading',
                    loadingStatus: false,
                });
            }
        }
    }, [newTxByPoolData, baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        if (newLimitsByPoolData) {
            const filteredNewLimitsByPoolData = newLimitsByPoolData.filter(
                (limit) => {
                    return (
                        limit.base.toLowerCase() ===
                            baseTokenAddress.toLowerCase() &&
                        limit.quote.toLowerCase() ===
                            quoteTokenAddress.toLowerCase()
                    );
                },
            );
            if (filteredNewLimitsByPoolData.length > 0) {
                setLimitOrdersByPool({
                    dataReceived: true,
                    limitOrders: filteredNewLimitsByPoolData,
                });
                setDataLoadingStatus({
                    datasetName: 'isPoolOrderDataLoading',
                    loadingStatus: false,
                });
            }
        }
    }, [newLimitsByPoolData, baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        if (newRangesByPoolData) {
            const filteredNewRangesByPoolData = newRangesByPoolData.filter(
                (position) => {
                    return (
                        position.base.toLowerCase() ===
                            baseTokenAddress.toLowerCase() &&
                        position.quote.toLowerCase() ===
                            quoteTokenAddress.toLowerCase()
                    );
                },
            );
            if (filteredNewRangesByPoolData.length > 0) {
                setPositionsByPool({
                    dataReceived: true,
                    positions: filteredNewRangesByPoolData,
                });
                setDataLoadingStatus({
                    datasetName: 'isPoolRangeDataLoading',
                    loadingStatus: false,
                });
            }
        }
    }, [newRangesByPoolData, baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        const currentPoolData = activePoolList?.find(
            (poolStat: PoolIF) =>
                poolStat.base.toLowerCase() ===
                    baseTokenAddress.toLowerCase() &&
                poolStat.quote.toLowerCase() ===
                    quoteTokenAddress.toLowerCase(),
        );
        setLiquidityFee(
            currentPoolData?.feeRate !== undefined
                ? currentPoolData.feeRate
                : undefined,
        );
    }, [activePoolList, baseTokenAddress, quoteTokenAddress]);

    // Sets up the asynchronous queries to TVL, volume and liquidity curve
    useEffect(() => {
        (async () => {
            if (
                isUserOnline &&
                contextMatchesParams &&
                crocEnv &&
                provider &&
                baseTokenAddress !== '' &&
                quoteTokenAddress !== '' &&
                (await crocEnv.context).chain.chainId === chainId &&
                isTradeRoute &&
                activePoolList
            ) {
                // retrieve pool_positions
                const allPositionsCacheEndpoint = GCGO_URL + '/pool_positions?';
                fetch(
                    allPositionsCacheEndpoint +
                        new URLSearchParams({
                            base: baseTokenAddress.toLowerCase(),
                            quote: quoteTokenAddress.toLowerCase(),
                            poolIdx: poolIndex.toString(),
                            chainId: chainId.toLowerCase(),
                            // n: '100',
                            n: '200',
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        const poolPositions = json.data;
                        if (poolPositions) {
                            Promise.all(
                                poolPositions.map(
                                    (position: PositionServerIF) => {
                                        return getPositionData(
                                            position,
                                            tokens.tokenUniv,
                                            crocEnv,
                                            provider,
                                            chainId,
                                            activePoolList,
                                            cachedFetchTokenPrice,
                                            cachedQuerySpotPrice,
                                            cachedTokenDetails,
                                        );
                                    },
                                ),
                            )
                                .then((updatedPositions) => {
                                    if (updatedPositions.length > 0) {
                                        setNewRangesByPoolData(
                                            updatedPositions,
                                        );
                                    } else {
                                        setNewRangesByPoolData(undefined);
                                        setPositionsByPool({
                                            dataReceived: false,
                                            positions: [],
                                        });
                                        setDataLoadingStatus({
                                            datasetName:
                                                'isPoolRangeDataLoading',
                                            loadingStatus: false,
                                        });
                                    }
                                })
                                .catch(console.error);
                        } else {
                            setNewRangesByPoolData(undefined);
                            setPositionsByPool({
                                dataReceived: false,
                                positions: [],
                            });
                            setDataLoadingStatus({
                                datasetName: 'isPoolRangeDataLoading',
                                loadingStatus: false,
                            });
                        }
                    })
                    .catch(console.error);

                // retrieve pool recent changes
                fetchPoolRecentChanges({
                    tokenList: tokens.tokenUniv,
                    base: baseTokenAddress,
                    quote: quoteTokenAddress,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: 100,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    activePoolList,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                })
                    .then((poolChangesJsonData) => {
                        if (
                            poolChangesJsonData &&
                            poolChangesJsonData.length > 0
                        ) {
                            const newTxByPoolDataWithoutFills =
                                poolChangesJsonData.filter(
                                    (tx) => tx.changeType !== 'cross',
                                );
                            setNewTxByPoolData(newTxByPoolDataWithoutFills);
                        } else {
                            setNewTxByPoolData(undefined);
                            setTransactionsByPool({
                                dataReceived: true,
                                changes: [],
                            });
                            setDataLoadingStatus({
                                datasetName: 'isPoolTxDataLoading',
                                loadingStatus: false,
                            });
                        }
                    })
                    .catch(console.error);

                fetchPoolLimitOrders({
                    tokenList: tokens.tokenUniv,
                    base: baseTokenAddress,
                    quote: quoteTokenAddress,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: 100,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    activePoolList,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                })
                    .then((updatedLimitOrderStates) => {
                        if (
                            updatedLimitOrderStates &&
                            updatedLimitOrderStates.length > 0
                        ) {
                            const filteredData = filterLimitArray(
                                updatedLimitOrderStates,
                            );
                            setNewLimitsByPoolData(filteredData);
                        } else {
                            setNewLimitsByPoolData(undefined);
                            setLimitOrdersByPool({
                                dataReceived: false,
                                limitOrders: [],
                            });
                            setDataLoadingStatus({
                                datasetName: 'isPoolOrderDataLoading',
                                loadingStatus: false,
                            });
                        }
                    })
                    .catch(console.error);
                if (userAddress) {
                    const userPoolTransactionsCacheEndpoint =
                        GCGO_URL + '/user_pool_txs?';
                    fetch(
                        userPoolTransactionsCacheEndpoint +
                            new URLSearchParams({
                                user: userAddress.toLowerCase(),
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: poolIndex.toString(),
                                chainId: chainId.toLowerCase(),
                                n: '200',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const userPoolTransactions =
                                json.data as TransactionIF[];
                            if (userPoolTransactions) {
                                const userPoolTransactionsWithoutFills =
                                    userPoolTransactions.filter(
                                        (tx) => tx.changeType !== 'cross',
                                    );
                                Promise.all(
                                    userPoolTransactionsWithoutFills.map(
                                        (position: TransactionServerIF) => {
                                            return getTransactionData(
                                                position,
                                                tokens.tokenUniv,
                                                crocEnv,
                                                provider,
                                                chainId,
                                                activePoolList,
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedTransactions) => {
                                        setUserTransactionsByPool({
                                            dataReceived: true,
                                            changes: updatedTransactions,
                                        });
                                        setDataLoadingStatus({
                                            datasetName:
                                                'isConnectedUserPoolTxDataLoading',
                                            loadingStatus: false,
                                        });
                                    })
                                    .catch(console.error);
                            } else {
                                setUserTransactionsByPool({
                                    dataReceived: false,
                                    changes: [],
                                });
                                setDataLoadingStatus({
                                    datasetName:
                                        'isConnectedUserPoolTxDataLoading',
                                    loadingStatus: false,
                                });
                            }
                        })
                        .catch(console.error);

                    // retrieve user_pool_positions
                    const userPoolPositionsCacheEndpoint =
                        GCGO_URL + '/user_pool_positions?';
                    const forceOnchainLiqUpdate = !isTestnet;
                    fetch(
                        userPoolPositionsCacheEndpoint +
                            new URLSearchParams({
                                user: userAddress.toLowerCase(),
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: poolIndex.toString(),
                                chainId: chainId.toLowerCase(),
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const userPoolPositions = json.data;

                            if (userPoolPositions) {
                                Promise.all(
                                    userPoolPositions.map(
                                        (position: PositionServerIF) => {
                                            return getPositionData(
                                                position,
                                                tokens.tokenUniv,
                                                crocEnv,
                                                provider,
                                                chainId,
                                                activePoolList,
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                                forceOnchainLiqUpdate,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        setUserPositionsByPool({
                                            dataReceived: true,
                                            positions: updatedPositions,
                                        });
                                        setDataLoadingStatus({
                                            datasetName:
                                                'isConnectedUserPoolRangeDataLoading',
                                            loadingStatus: false,
                                        });
                                    })
                                    .catch(console.error);
                            } else {
                                setUserPositionsByPool({
                                    dataReceived: false,
                                    positions: [],
                                });
                                setDataLoadingStatus({
                                    datasetName:
                                        'isConnectedUserPoolRangeDataLoading',
                                    loadingStatus: false,
                                });
                            }
                        })
                        .catch(console.error);

                    // retrieve user_pool_limit_orders
                    const userPoolLimitOrdersCacheEndpoint =
                        GCGO_URL + '/user_pool_limit_orders?';
                    fetch(
                        userPoolLimitOrdersCacheEndpoint +
                            new URLSearchParams({
                                user: userAddress.toLowerCase(),
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: poolIndex.toString(),
                                chainId: chainId.toLowerCase(),
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const userPoolLimitOrderStates = json?.data;
                            if (userPoolLimitOrderStates) {
                                Promise.all(
                                    userPoolLimitOrderStates.map(
                                        (limitOrder: LimitOrderServerIF) => {
                                            return getLimitOrderData(
                                                limitOrder,
                                                tokens.tokenUniv,
                                                crocEnv,
                                                provider,
                                                chainId,
                                                activePoolList,
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                            );
                                        },
                                    ),
                                ).then((updatedLimitOrderStates) => {
                                    const filteredData = filterLimitArray(
                                        updatedLimitOrderStates,
                                    );
                                    setUserLimitOrdersByPool({
                                        dataReceived: true,
                                        limitOrders: filteredData,
                                    });

                                    setDataLoadingStatus({
                                        datasetName:
                                            'isConnectedUserPoolOrderDataLoading',
                                        loadingStatus: false,
                                    });
                                });
                            } else {
                                setUserLimitOrdersByPool({
                                    dataReceived: false,
                                    limitOrders: [],
                                });
                                setDataLoadingStatus({
                                    datasetName:
                                        'isConnectedUserPoolOrderDataLoading',
                                    loadingStatus: false,
                                });
                            }
                        })
                        .catch(console.error);
                }
            }
        })();
    }, [
        isUserOnline,
        userAddress,
        contextMatchesParams,
        crocEnv,
        baseTokenAddress !== '' && quoteTokenAddress !== '',
        chainId,
        tokens.tokenUniv,
        isUserIdle
            ? Math.floor(Date.now() / 60000) // cache for 60 seconds if idle
            : Math.floor(Date.now() / 10000), // cache for 10 seconds if not idle
        provider,
        sessionReceipts.length,
        blockPollingUrl,
        isTradeRoute,
        activePoolList,
    ]);

    const totalPositionUsdValue = useMemo(() => {
        if (
            !positionsByPool?.dataReceived &&
            !limitOrdersByPool?.dataReceived
        ) {
            return 0;
        }

        const positionsSum =
            positionsByPool?.dataReceived &&
            Array.isArray(positionsByPool.positions)
                ? positionsByPool.positions.reduce(
                      (sum, position) => sum + (position.totalValueUSD || 0),
                      0,
                  )
                : 0;

        const limitOrdersSum =
            limitOrdersByPool?.dataReceived &&
            Array.isArray(limitOrdersByPool.limitOrders)
                ? limitOrdersByPool.limitOrders.reduce(
                      (sum, order) => sum + (order.totalValueUSD || 0),
                      0,
                  )
                : 0;

        return positionsSum + limitOrdersSum;
    }, [positionsByPool, limitOrdersByPool]);

    const [rawLiqData, setRawLiqData] = useState<
        | {
              rawCurveData: LiquidityCurveServerIF;
              request: {
                  baseAddress: string;
                  quoteAddress: string;
                  chainId: string;
                  poolIndex: number;
              };
          }
        | undefined
    >();

    const prevTotalPositionUsdValue = useRef(0);
    const totalPositionUsdValueForUpdateTrigger = useRef(0);

    useEffect(() => {
        const change =
            Math.abs(
                totalPositionUsdValue - prevTotalPositionUsdValue.current,
            ) / totalPositionUsdValue;

        if (change < 0.01) return; // Skip effect if change is less than 1%

        totalPositionUsdValueForUpdateTrigger.current =
            prevTotalPositionUsdValue.current === 0 ? 0 : totalPositionUsdValue;
        prevTotalPositionUsdValue.current = totalPositionUsdValue;
    }, [totalPositionUsdValue]);

    const [crocEnvChainMatches, setCrocEnvChainMatches] =
        useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (crocEnv) {
                setCrocEnvChainMatches(
                    (await crocEnv.context).chain.chainId === chainId,
                );
            } else {
                setCrocEnvChainMatches(false);
            }
        })();
    }, [crocEnv, chainId]);

    const [tokenChainMatches, setTokenChainMatches] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (tokenA && tokenB && chainId) {
                setTokenChainMatches(
                    tokenA.chainId === parseInt(chainId) &&
                        tokenB.chainId === parseInt(chainId),
                );
            } else {
                setCrocEnvChainMatches(false);
            }
        })();
    }, [tokenA, tokenB, chainId]);

    useEffect(() => {
        (async () => {
            if (
                baseTokenAddress &&
                quoteTokenAddress &&
                crocEnv &&
                GCGO_URL &&
                crocEnvChainMatches &&
                tokenChainMatches &&
                isChartVisible &&
                contextMatchesParams
            ) {
                const request = {
                    baseAddress: baseTokenAddress.toLowerCase(),
                    quoteAddress: quoteTokenAddress.toLowerCase(),
                    chainId: chainId,
                    poolIndex: poolIndex,
                    currentTVL: totalPositionUsdValueForUpdateTrigger.current,
                };
                if (
                    JSON.stringify(request) !==
                    JSON.stringify(rawLiqData?.request)
                ) {
                    fetchPoolLiquidity(
                        chainId,
                        baseTokenAddress.toLowerCase(),
                        quoteTokenAddress.toLowerCase(),
                        poolIndex,
                        GCGO_URL,
                    )
                        .then((rawCurveData) => {
                            if (rawCurveData) {
                                setRawLiqData({ rawCurveData, request });
                            }
                        })
                        .catch(console.error);
                }
            }
        })();
    }, [
        crocEnvChainMatches,
        tokenChainMatches,
        chainId,
        baseTokenAddress,
        quoteTokenAddress,
        poolIndex,
        GCGO_URL,
        totalPositionUsdValueForUpdateTrigger.current,
        isChartVisible,
        contextMatchesParams,
    ]);

    useEffect(() => {
        (async () => {
            if (
                rawLiqData &&
                crocEnv &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                const { rawCurveData, request } = rawLiqData;

                const expandedLiqData = await expandLiquidityData(
                    rawCurveData,
                    request.baseAddress,
                    baseTokenDecimals,
                    request.quoteAddress,
                    quoteTokenDecimals,
                    request.poolIndex,
                    chainId,
                    crocEnv,
                    cachedFetchTokenPrice,
                    cachedQuerySpotTick,
                    currentPoolPriceTick,
                );
                if (expandedLiqData) {
                    setLiquidity(expandedLiqData, request);
                }
            }
        })();
    }, [rawLiqData, crocEnv, chainId, currentPoolPriceTick]);

    return {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals, // Token contract decimals
        quoteTokenDecimals, // Token contract decimals
        isChartVisible,
    };
}
