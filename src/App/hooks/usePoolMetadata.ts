import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
    fetchPoolLiquidity,
    fetchPoolRecentChanges,
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

// Hooks to update metadata and volume/TVL/liquidity curves on a per-pool basis
export function usePoolMetadata() {
    const { setDataLoadingStatus } = useContext(DataLoadingContext);
    const { gcgoPoolList, blockPollingUrl } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { sessionReceipts } = useContext(ReceiptContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        isUserIdle,
        isUserOnline,
        activeNetwork: { chainId, poolIndex, GCGO_URL },
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

    const {
        tokenA,
        tokenB,
        defaultRangeWidthForActivePool,
        currentPoolPriceTick,
    } = useContext(TradeDataContext);

    const {
        cachedQuerySpotPrice,
        cachedQuerySpotTick,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const { pathname } = location;

    const ticksInParams =
        pathname.includes('lowTick') && pathname.includes('highTick');

    // hook to sync token addresses in RTK to token addresses in RTK
    const contextMatchesParams = useMemo(() => {
        let matching = false;
        const tokenAAddress = tokenA.address;
        const tokenBAddress = tokenB.address;

        if (pathname.includes('tokenA') && pathname.includes('tokenB')) {
            const getAddrFromParams = (token: string) => {
                const idx = pathname.indexOf(token);
                const address = pathname.substring(idx + 7, idx + 49);
                return address;
            };
            const addrTokenA = getAddrFromParams('tokenA');
            const addrTokenB = getAddrFromParams('tokenB');
            if (
                addrTokenA.toLowerCase() === tokenAAddress.toLowerCase() &&
                addrTokenB.toLowerCase() === tokenBAddress.toLowerCase()
            ) {
                matching = true;
            }
        }

        return matching;
    }, [pathname, tokenA, tokenB]);

    const baseTokenAddress = useMemo(
        () => sortBaseQuoteTokens(tokenA.address, tokenB.address)[0],
        [tokenA, tokenB],
    );

    const quoteTokenAddress = useMemo(
        () => sortBaseQuoteTokens(tokenA.address, tokenB.address)[1],
        [tokenA, tokenB],
    );

    const isTokenABase = useMemo(
        () =>
            tokenA.address ===
            sortBaseQuoteTokens(tokenA.address, tokenB.address)[0],
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
        const currentPoolData = gcgoPoolList?.find(
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
    }, [gcgoPoolList, baseTokenAddress, quoteTokenAddress]);

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
                (await crocEnv.context).chain.chainId === chainId
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
                        const skipENSFetch = true;
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
                                            cachedFetchTokenPrice,
                                            cachedQuerySpotPrice,
                                            cachedTokenDetails,
                                            cachedEnsResolve,
                                            skipENSFetch,
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
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
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
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
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
                            const skipENSFetch = true;
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
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                                cachedEnsResolve,
                                                skipENSFetch,
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
                    const forceOnchainLiqUpdate = true;
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
                            const skipENSFetch = true;

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
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                                cachedEnsResolve,
                                                skipENSFetch,
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
                                                cachedFetchTokenPrice,
                                                cachedQuerySpotPrice,
                                                cachedTokenDetails,
                                                cachedEnsResolve,
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
    ]);

    const totalPositionLiq = useMemo(
        () =>
            positionsByPool.positions.reduce((sum, position) => {
                return sum + position.positionLiq;
            }, 0) +
            limitOrdersByPool.limitOrders.reduce((sum, order) => {
                return sum + order.positionLiq;
            }, 0),
        [positionsByPool, limitOrdersByPool],
    );

    useEffect(() => {
        (async () => {
            if (
                baseTokenAddress &&
                quoteTokenAddress &&
                baseTokenDecimals &&
                quoteTokenDecimals &&
                crocEnv &&
                currentPoolPriceTick &&
                totalPositionLiq &&
                GCGO_URL &&
                Math.abs(currentPoolPriceTick) !== Infinity &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                // Reset existing liquidity data until the fetch completes, because it's a new pool
                const request = {
                    baseAddress: baseTokenAddress.toLowerCase(),
                    quoteAddress: quoteTokenAddress.toLowerCase(),
                    chainId: chainId,
                    poolIndex: poolIndex,
                };

                fetchPoolLiquidity(
                    chainId,
                    baseTokenAddress.toLowerCase(),
                    baseTokenDecimals,
                    quoteTokenAddress.toLowerCase(),
                    quoteTokenDecimals,
                    poolIndex,
                    crocEnv,
                    GCGO_URL,
                    cachedFetchTokenPrice,
                    cachedQuerySpotTick,
                    currentPoolPriceTick,
                )
                    .then((liqCurve) => {
                        if (liqCurve) {
                            setLiquidity(liqCurve, request);
                        }
                    })
                    .catch(console.error);
            }
        })();
    }, [
        currentPoolPriceTick,
        totalPositionLiq,
        crocEnv,
        chainId,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        poolIndex,
        GCGO_URL,
    ]);
    return {
        contextMatchesParams,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals, // Token contract decimals
        quoteTokenDecimals, // Token contract decimals
        isTokenABase, // True if the base token is the first token in the panel (e.g. sell token on swap)
    };
}
