import { ChainSpec, CrocEnv, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    GCGO_OVERRIDE_URL,
    CACHE_UPDATE_FREQ_IN_MS,
} from '../../ambient-utils/constants';
import {
    LimitOrderServerIF,
    PositionIF,
    PositionServerIF,
    TokenIF,
    TransactionServerIF,
} from '../../ambient-utils/types';
import {
    TokenPriceFn,
    FetchAddrFn,
    FetchContractDetailsFn,
    fetchPoolRecentChanges,
    fetchPoolLiquidity,
} from '../../ambient-utils/api';
import {
    SpotPriceFn,
    getLimitOrderData,
    getPositionData,
    getTransactionData,
} from '../../ambient-utils/dataLayer';
import useDebounce from './useDebounce';
import { Provider } from '@ethersproject/providers';
import { DataLoadingContext } from '../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../contexts/GraphDataContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { RangeContext } from '../../contexts/RangeContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';

interface PoolParamsHookIF {
    crocEnv?: CrocEnv;
    graphCacheUrl: string;
    provider?: Provider;
    pathname: string;
    chainData: ChainSpec;
    userAddress: `0x${string}` | undefined;
    searchableTokens: TokenIF[];
    receiptCount: number;
    lastBlockNumber: number;
    isServerEnabled: boolean;
    isChartEnabled: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

// Hooks to update metadata and volume/TVL/liquidity curves on a per-pool basis
export function usePoolMetadata(props: PoolParamsHookIF) {
    const { tokenA, tokenB } = useContext(TradeDataContext);
    const { setDataLoadingStatus } = useContext(DataLoadingContext);
    const {
        setUserPositionsByPool,
        setUserTransactionsByPool,
        setPositionsByPool,
        setLeaderboardByPool,
        setTransactionsByPool,
        setLimitOrdersByPool,
        setUserLimitOrdersByPool,
        setLiquidity,
        setLiquidityFee,
    } = useContext(GraphDataContext);

    const { cachedGetLiquidityFee } = useContext(CachedDataContext);

    const { setAdvancedLowTick, setAdvancedHighTick, setAdvancedMode } =
        useContext(RangeContext);
    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(false);

    const ticksInParams =
        props.pathname.includes('lowTick') &&
        props.pathname.includes('highTick');

    // hook to sync token addresses in RTK to token addresses in RTK
    const contextMatchesParams = useMemo(() => {
        let matching = false;
        const tokenAAddress = tokenA.address;
        const tokenBAddress = tokenB.address;
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
                addrTokenA.toLowerCase() === tokenAAddress.toLowerCase() &&
                addrTokenB.toLowerCase() === tokenBAddress.toLowerCase()
            ) {
                matching = true;
            }
        }
        return matching;
    }, [
        props.pathname,
        tokenA.address,
        tokenA.chainId,
        tokenB.address,
        tokenB.chainId,
    ]);

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(props.lastBlockNumber, 2000);

    // Token and range housekeeping when switching pairs
    useEffect(() => {
        if (contextMatchesParams && props.crocEnv) {
            if (!ticksInParams) {
                setAdvancedLowTick(0);
                setAdvancedHighTick(0);
                setAdvancedMode(false);
                props.setSimpleRangeWidth(10);
            }

            const tokenAAddress = tokenA.address;
            const tokenBAddress = tokenB.address;

            if (tokenAAddress && tokenBAddress) {
                const sortedTokens = sortBaseQuoteTokens(
                    tokenAAddress,
                    tokenBAddress,
                );

                setBaseTokenAddress(sortedTokens[0]);
                setQuoteTokenAddress(sortedTokens[1]);
                if (tokenA.address === sortedTokens[0]) {
                    setIsTokenABase(true);
                    setBaseTokenDecimals(tokenA.decimals);
                    setQuoteTokenDecimals(tokenB.decimals);
                } else {
                    setIsTokenABase(false);
                    setBaseTokenDecimals(tokenB.decimals);
                    setQuoteTokenDecimals(tokenA.decimals);
                }
            }
        }
    }, [
        contextMatchesParams,
        tokenA.address,
        tokenB.address,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.searchableTokens,
        props.lastBlockNumber == 0,
        !!props.crocEnv,
    ]);

    // Reset loading states when token values change
    useEffect(() => {
        setDataLoadingStatus({
            datasetName: 'isPoolRangeDataLoading',
            loadingStatus: true,
        });
        setDataLoadingStatus({
            datasetName: 'isPoolTxDataLoading',
            loadingStatus: true,
        });
        setDataLoadingStatus({
            datasetName: 'isPoolOrderDataLoading',
            loadingStatus: true,
        });
        setDataLoadingStatus({
            datasetName: 'isConnectedUserRangeDataLoading',
            loadingStatus: true,
        });
        setDataLoadingStatus({
            datasetName: 'isConnectedUserPoolOrderDataLoading',
            loadingStatus: true,
        });
    }, [baseTokenAddress, quoteTokenAddress]);

    // Sets up the asynchronous queries to TVL, volume and liquidity curve
    useEffect(() => {
        if (
            contextMatchesParams &&
            props.crocEnv &&
            props.provider !== undefined
        ) {
            if (baseTokenAddress && quoteTokenAddress) {
                // retrieve pool liquidity provider fee
                if (props.isServerEnabled) {
                    cachedGetLiquidityFee(
                        baseTokenAddress,
                        quoteTokenAddress,
                        props.chainData.poolIndex,
                        props.chainData.chainId,
                        props.graphCacheUrl,
                        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                    )
                        .then((liquidityFeeNum) => {
                            if (liquidityFeeNum)
                                setLiquidityFee(liquidityFeeNum);
                        })
                        .catch(console.error);

                    // retrieve pool_positions
                    const allPositionsCacheEndpoint = GCGO_OVERRIDE_URL
                        ? GCGO_OVERRIDE_URL + '/pool_positions?'
                        : props.graphCacheUrl + '/pool_positions?';
                    fetch(
                        allPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: props.chainData.poolIndex.toString(),
                                chainId: props.chainData.chainId,
                                annotate: 'true', // token quantities
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                omitKnockout: 'true',
                                addValue: 'true',
                                n: '200',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const poolPositions = json.data;
                            const crocEnv = props.crocEnv;
                            const provider = props.provider;
                            const skipENSFetch = true;
                            if (poolPositions && crocEnv && provider) {
                                Promise.all(
                                    poolPositions.map(
                                        (position: PositionServerIF) => {
                                            return getPositionData(
                                                position,
                                                props.searchableTokens,
                                                crocEnv,
                                                provider,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
                                                skipENSFetch,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        setPositionsByPool({
                                            dataReceived: true,
                                            positions: updatedPositions,
                                        });
                                        setDataLoadingStatus({
                                            datasetName:
                                                'isPoolRangeDataLoading',
                                            loadingStatus: false,
                                        });
                                    })
                                    .catch(console.error);
                            } else {
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

                    // retrieve positions for leaderboard
                    const poolPositionsCacheEndpoint = GCGO_OVERRIDE_URL
                        ? GCGO_OVERRIDE_URL + '/pool_position_apy_leaders?'
                        : props.graphCacheUrl + '/pool_position_apy_leaders?';
                    fetch(
                        poolPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
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
                            const provider = props.provider;
                            const skipENSFetch = true;

                            if (leaderboardPositions && crocEnv && provider) {
                                Promise.all(
                                    leaderboardPositions.map(
                                        (position: PositionServerIF) => {
                                            return getPositionData(
                                                position,
                                                props.searchableTokens,
                                                crocEnv,
                                                provider,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
                                                skipENSFetch,
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

                                        setLeaderboardByPool({
                                            dataReceived: true,
                                            positions: top10Positions,
                                        });
                                    })
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    // retrieve pool recent changes
                    fetchPoolRecentChanges({
                        tokenList: props.searchableTokens,
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: props.chainData.poolIndex,
                        chainId: props.chainData.chainId,
                        annotate: true,
                        addValue: true,
                        simpleCalc: true,
                        annotateMEV: false,
                        ensResolution: true,
                        n: 200,
                        crocEnv: props.crocEnv,
                        graphCacheUrl: props.graphCacheUrl,
                        provider: props.provider,
                        lastBlockNumber: props.lastBlockNumber,
                        cachedFetchTokenPrice: props.cachedFetchTokenPrice,
                        cachedQuerySpotPrice: props.cachedQuerySpotPrice,
                        cachedTokenDetails: props.cachedTokenDetails,
                        cachedEnsResolve: props.cachedEnsResolve,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                setTransactionsByPool({
                                    dataReceived: true,
                                    changes: poolChangesJsonData,
                                });
                                setDataLoadingStatus({
                                    datasetName: 'isPoolTxDataLoading',
                                    loadingStatus: false,
                                });
                            }
                        })
                        .catch(console.error);

                    // retrieve pool limit order states
                    const poolLimitOrderStatesCacheEndpoint = GCGO_OVERRIDE_URL
                        ? GCGO_OVERRIDE_URL + '/pool_limit_orders?'
                        : props.graphCacheUrl + '/pool_limit_orders?';

                    fetch(
                        poolLimitOrderStatesCacheEndpoint +
                            new URLSearchParams({
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: props.chainData.poolIndex.toString(),
                                chainId: props.chainData.chainId,
                                n: '200',
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLimitOrderStates = json?.data;
                            const crocEnv = props.crocEnv;
                            const provider = props.provider;
                            const skipENSFetch = true;
                            if (poolLimitOrderStates && crocEnv && provider) {
                                Promise.all(
                                    poolLimitOrderStates.map(
                                        (limitOrder: LimitOrderServerIF) => {
                                            return getLimitOrderData(
                                                limitOrder,
                                                props.searchableTokens,
                                                crocEnv,
                                                provider,
                                                props.chainData.chainId,
                                                props.lastBlockNumber,
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
                                                skipENSFetch,
                                            );
                                        },
                                    ),
                                ).then((updatedLimitOrderStates) => {
                                    setLimitOrdersByPool({
                                        dataReceived: true,
                                        limitOrders: updatedLimitOrderStates,
                                    });
                                    setDataLoadingStatus({
                                        datasetName: 'isPoolOrderDataLoading',
                                        loadingStatus: false,
                                    });
                                });
                            } else {
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
                    if (props.userAddress) {
                        // retrieve user_pool_positions
                        const userPoolTransactionsCacheEndpoint =
                            GCGO_OVERRIDE_URL
                                ? GCGO_OVERRIDE_URL + '/user_pool_txs?'
                                : props.graphCacheUrl + '/user_pool_txs?';
                        fetch(
                            userPoolTransactionsCacheEndpoint +
                                new URLSearchParams({
                                    user: props.userAddress,
                                    base: baseTokenAddress.toLowerCase(),
                                    quote: quoteTokenAddress.toLowerCase(),
                                    poolIdx:
                                        props.chainData.poolIndex.toString(),
                                    chainId: props.chainData.chainId,
                                }),
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                const userPoolTransactions = json.data;
                                const crocEnv = props.crocEnv;
                                const provider = props.provider;
                                const skipENSFetch = true;
                                if (
                                    userPoolTransactions &&
                                    crocEnv &&
                                    provider
                                ) {
                                    Promise.all(
                                        userPoolTransactions.map(
                                            (position: TransactionServerIF) => {
                                                return getTransactionData(
                                                    position,
                                                    props.searchableTokens,
                                                    crocEnv,
                                                    provider,
                                                    props.chainData.chainId,
                                                    props.lastBlockNumber,
                                                    props.cachedFetchTokenPrice,
                                                    props.cachedQuerySpotPrice,
                                                    props.cachedTokenDetails,
                                                    props.cachedEnsResolve,
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
                        const userPoolPositionsCacheEndpoint = GCGO_OVERRIDE_URL
                            ? GCGO_OVERRIDE_URL + '/user_pool_positions?'
                            : props.graphCacheUrl + '/user_pool_positions?';
                        fetch(
                            userPoolPositionsCacheEndpoint +
                                new URLSearchParams({
                                    user: props.userAddress,
                                    base: baseTokenAddress.toLowerCase(),
                                    quote: quoteTokenAddress.toLowerCase(),
                                    poolIdx:
                                        props.chainData.poolIndex.toString(),
                                    chainId: props.chainData.chainId,
                                }),
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                const userPoolPositions = json.data;
                                const crocEnv = props.crocEnv;
                                const provider = props.provider;
                                const skipENSFetch = true;

                                if (userPoolPositions && crocEnv && provider) {
                                    Promise.all(
                                        userPoolPositions.map(
                                            (position: PositionServerIF) => {
                                                return getPositionData(
                                                    position,
                                                    props.searchableTokens,
                                                    crocEnv,
                                                    provider,
                                                    props.chainData.chainId,
                                                    props.lastBlockNumber,
                                                    props.cachedFetchTokenPrice,
                                                    props.cachedQuerySpotPrice,
                                                    props.cachedTokenDetails,
                                                    props.cachedEnsResolve,
                                                    skipENSFetch,
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
                            GCGO_OVERRIDE_URL
                                ? GCGO_OVERRIDE_URL + '/user_pool_limit_orders?'
                                : props.graphCacheUrl +
                                  '/user_pool_limit_orders?';
                        fetch(
                            userPoolLimitOrdersCacheEndpoint +
                                new URLSearchParams({
                                    user: props.userAddress,
                                    base: baseTokenAddress.toLowerCase(),
                                    quote: quoteTokenAddress.toLowerCase(),
                                    poolIdx:
                                        props.chainData.poolIndex.toString(),
                                    chainId: props.chainData.chainId,
                                }),
                        )
                            .then((response) => response?.json())
                            .then((json) => {
                                const userPoolLimitOrderStates = json?.data;
                                const crocEnv = props.crocEnv;
                                const provider = props.provider;
                                const skipENSFetch = true;
                                if (
                                    userPoolLimitOrderStates &&
                                    crocEnv &&
                                    provider
                                ) {
                                    Promise.all(
                                        userPoolLimitOrderStates.map(
                                            (
                                                limitOrder: LimitOrderServerIF,
                                            ) => {
                                                return getLimitOrderData(
                                                    limitOrder,
                                                    props.searchableTokens,
                                                    crocEnv,
                                                    provider,
                                                    props.chainData.chainId,
                                                    props.lastBlockNumber,
                                                    props.cachedFetchTokenPrice,
                                                    props.cachedQuerySpotPrice,
                                                    props.cachedTokenDetails,
                                                    props.cachedEnsResolve,
                                                    skipENSFetch,
                                                );
                                            },
                                        ),
                                    ).then((updatedLimitOrderStates) => {
                                        setUserLimitOrdersByPool({
                                            dataReceived: true,
                                            limitOrders:
                                                updatedLimitOrderStates,
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
            }
        }
    }, [
        props.userAddress,
        props.receiptCount,
        contextMatchesParams,
        baseTokenAddress,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.searchableTokens,
        lastBlockNumWait,
        !!props.crocEnv,
        !!props.provider,
    ]);

    useEffect(() => {
        // Reset existing liquidity data until the fetch completes, because it's a new pool
        const request = {
            baseAddress: baseTokenAddress,
            quoteAddress: quoteTokenAddress,
            chainId: props.chainData.chainId,
            poolIndex: props.chainData.poolIndex,
        };

        const crocEnv = props.crocEnv;
        if (
            props.isChartEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            props.chainData &&
            props.lastBlockNumber &&
            crocEnv
        )
            fetchPoolLiquidity(
                props.chainData.chainId,
                baseTokenAddress.toLowerCase(),
                quoteTokenAddress.toLowerCase(),
                props.chainData.poolIndex,
                crocEnv,
                props.graphCacheUrl,
                props.cachedFetchTokenPrice,
            )
                .then((liqCurve) => {
                    if (liqCurve) {
                        setLiquidity(liqCurve, request);
                    }
                })
                .catch(console.error);
    }, [
        baseTokenAddress,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        lastBlockNumWait,
        props.isChartEnabled,
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
