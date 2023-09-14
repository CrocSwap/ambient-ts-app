import { ChainSpec, CrocEnv, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { GRAPHCACHE_SMALL_URL } from '../../constants';
import { getMainnetEquivalent } from '../../utils/data/testTokenMap';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { LimitOrderServerIF } from '../../utils/interfaces/LimitOrderIF';
import {
    PositionIF,
    PositionServerIF,
} from '../../utils/interfaces/PositionIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import {
    resetPoolDataLoadingStatus,
    setChangesByPool,
    setDataLoadingStatus,
    setLeaderboardByPool,
    setLimitOrdersByPool,
    setLiquidity,
    setLiquidityPending,
    setPositionsByPool,
    setUserLimitOrdersByPool,
    setUserPositionsByPool,
} from '../../utils/state/graphDataSlice';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setLiquidityFee,
} from '../../utils/state/tradeDataSlice';
import { FetchAddrFn } from '../functions/fetchAddress';
import { FetchContractDetailsFn } from '../functions/fetchContractDetails';
import { fetchPoolRecentChanges } from '../functions/fetchPoolRecentChanges';
import { TokenPriceFn } from '../functions/fetchTokenPrice';
import { getLimitOrderData } from '../functions/getLimitOrderData';
import { fetchPoolLiquidity } from '../functions/fetchPoolLiquidity';
import { getPositionData } from '../functions/getPositionData';
import { SpotPriceFn } from '../functions/querySpotPrice';
import useDebounce from './useDebounce';
import { getLiquidityFee } from '../functions/getPoolStats';

interface PoolParamsHookIF {
    crocEnv?: CrocEnv;
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
    const dispatch = useAppDispatch();
    const tradeData = useAppSelector((state) => state.tradeData);

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

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(props.lastBlockNumber, 2000);

    // Token and range housekeeping when switching pairs
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

                const { token: tokenAMainnetEquivalent } = getMainnetEquivalent(
                    tokenAAddress,
                    props.chainData.chainId,
                );
                const { token: tokenBMainnetEquivalent } = getMainnetEquivalent(
                    tokenBAddress,
                    props.chainData.chainId,
                );

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
            }
        }
    }, [
        rtkMatchesParams,
        tradeData.tokenA.address,
        tradeData.tokenB.address,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.searchableTokens,
        props.lastBlockNumber == 0,
        !!props.crocEnv,
    ]);

    // Reset loading states when token values change
    useEffect(() => {
        dispatch(
            setDataLoadingStatus({
                datasetName: 'poolRangeData',
                loadingStatus: true,
            }),
        );
        dispatch(
            setDataLoadingStatus({
                datasetName: 'poolTxData',
                loadingStatus: true,
            }),
        );
        dispatch(
            setDataLoadingStatus({
                datasetName: 'poolOrderData',
                loadingStatus: true,
            }),
        );
        dispatch(
            setDataLoadingStatus({
                datasetName: 'connectedUserPoolRangeData',
                loadingStatus: true,
            }),
        );
        dispatch(
            setDataLoadingStatus({
                datasetName: 'connectedUserPoolOrderData',
                loadingStatus: true,
            }),
        );
    }, [tradeData.baseToken.address, tradeData.quoteToken.address]);

    // Sets up the asynchronous queries to TVL, volume and liquidity curve and translates
    // to equivalent mainnet tokens so the chart renders mainnet data even in testnet
    useEffect(() => {
        if (rtkMatchesParams && props.crocEnv) {
            dispatch(resetPoolDataLoadingStatus());
            const tokenAAddress = tradeData.tokenA.address;
            const tokenBAddress = tradeData.tokenB.address;

            if (tokenAAddress && tokenBAddress) {
                const sortedTokens = sortBaseQuoteTokens(
                    tokenAAddress,
                    tokenBAddress,
                );

                // retrieve pool liquidity provider fee
                if (props.isServerEnabled) {
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
                                n: '200',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const poolPositions = json.data;
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
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
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
                                        dispatch(
                                            setDataLoadingStatus({
                                                datasetName: 'poolRangeData',
                                                loadingStatus: false,
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
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolRangeData',
                                        loadingStatus: false,
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
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
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
                        n: 200,
                        crocEnv: props.crocEnv,
                        lastBlockNumber: props.lastBlockNumber,
                        cachedFetchTokenPrice: props.cachedFetchTokenPrice,
                        cachedQuerySpotPrice: props.cachedQuerySpotPrice,
                        cachedTokenDetails: props.cachedTokenDetails,
                        cachedEnsResolve: props.cachedEnsResolve,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                dispatch(
                                    setChangesByPool({
                                        dataReceived: true,
                                        changes: poolChangesJsonData,
                                    }),
                                );
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolTxData',
                                        loadingStatus: false,
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
                                n: '200',
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLimitOrderStates = json?.data;
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
                                                props.cachedFetchTokenPrice,
                                                props.cachedQuerySpotPrice,
                                                props.cachedTokenDetails,
                                                props.cachedEnsResolve,
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
                                    dispatch(
                                        setDataLoadingStatus({
                                            datasetName: 'poolOrderData',
                                            loadingStatus: false,
                                        }),
                                    );
                                });
                            } else {
                                dispatch(
                                    setLimitOrdersByPool({
                                        dataReceived: false,
                                        limitOrders: [],
                                    }),
                                );
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolOrderData',
                                        loadingStatus: false,
                                    }),
                                );
                            }
                        })
                        .catch(console.error);
                    if (props.userAddress) {
                        // retrieve user_pool_positions
                        const userPoolPositionsCacheEndpoint =
                            GRAPHCACHE_SMALL_URL + '/user_pool_positions?';
                        fetch(
                            userPoolPositionsCacheEndpoint +
                                new URLSearchParams({
                                    user: props.userAddress,
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx:
                                        props.chainData.poolIndex.toString(),
                                    chainId: props.chainData.chainId,
                                }),
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                const userPoolPositions = json.data;
                                const crocEnv = props.crocEnv;
                                if (userPoolPositions && crocEnv) {
                                    Promise.all(
                                        userPoolPositions.map(
                                            (position: PositionServerIF) => {
                                                return getPositionData(
                                                    position,
                                                    props.searchableTokens,
                                                    crocEnv,
                                                    props.chainData.chainId,
                                                    props.lastBlockNumber,
                                                    props.cachedFetchTokenPrice,
                                                    props.cachedQuerySpotPrice,
                                                    props.cachedTokenDetails,
                                                    props.cachedEnsResolve,
                                                );
                                            },
                                        ),
                                    )
                                        .then((updatedPositions) => {
                                            dispatch(
                                                setUserPositionsByPool({
                                                    dataReceived: true,
                                                    positions: updatedPositions,
                                                }),
                                            );
                                            dispatch(
                                                setDataLoadingStatus({
                                                    datasetName:
                                                        'connectedUserPoolRangeData',
                                                    loadingStatus: false,
                                                }),
                                            );
                                        })
                                        .catch(console.error);
                                } else {
                                    dispatch(
                                        setUserPositionsByPool({
                                            dataReceived: false,
                                            positions: [],
                                        }),
                                    );
                                    dispatch(
                                        setDataLoadingStatus({
                                            datasetName:
                                                'connectedUserPoolRangeData',
                                            loadingStatus: false,
                                        }),
                                    );
                                }
                            })
                            .catch(console.error);

                        // retrieve user_pool_limit_orders
                        const userPoolLimitOrdersCacheEndpoint =
                            GRAPHCACHE_SMALL_URL + '/user_pool_limit_orders?';
                        fetch(
                            userPoolLimitOrdersCacheEndpoint +
                                new URLSearchParams({
                                    user: props.userAddress,
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx:
                                        props.chainData.poolIndex.toString(),
                                    chainId: props.chainData.chainId,
                                }),
                        )
                            .then((response) => response?.json())
                            .then((json) => {
                                const userPoolLimitOrderStates = json?.data;
                                const crocEnv = props.crocEnv;
                                if (userPoolLimitOrderStates && crocEnv) {
                                    Promise.all(
                                        userPoolLimitOrderStates.map(
                                            (
                                                limitOrder: LimitOrderServerIF,
                                            ) => {
                                                return getLimitOrderData(
                                                    limitOrder,
                                                    props.searchableTokens,
                                                    crocEnv,
                                                    props.chainData.chainId,
                                                    props.lastBlockNumber,
                                                    props.cachedFetchTokenPrice,
                                                    props.cachedQuerySpotPrice,
                                                    props.cachedTokenDetails,
                                                    props.cachedEnsResolve,
                                                );
                                            },
                                        ),
                                    ).then((updatedLimitOrderStates) => {
                                        dispatch(
                                            setUserLimitOrdersByPool({
                                                dataReceived: true,
                                                limitOrders:
                                                    updatedLimitOrderStates,
                                            }),
                                        );

                                        dispatch(
                                            setDataLoadingStatus({
                                                datasetName:
                                                    'connectedUserPoolOrderData',
                                                loadingStatus: false,
                                            }),
                                        );
                                    });
                                } else {
                                    dispatch(
                                        setUserLimitOrdersByPool({
                                            dataReceived: false,
                                            limitOrders: [],
                                        }),
                                    );
                                    dispatch(
                                        setDataLoadingStatus({
                                            datasetName:
                                                'connectedUserPoolOrderData',
                                            loadingStatus: false,
                                        }),
                                    );
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
        rtkMatchesParams,
        tradeData.tokenA.address,
        tradeData.tokenB.address,
        quoteTokenAddress,
        props.chainData.chainId,
        props.chainData.poolIndex,
        props.searchableTokens,
        lastBlockNumWait,
        !!props.crocEnv,
    ]);

    useEffect(() => {
        // Reset existing liquidity data until the fetch completes, because it's a new pool
        const request = {
            baseAddress: baseTokenAddress,
            quoteAddress: quoteTokenAddress,
            chainId: props.chainData.chainId,
            poolIndex: props.chainData.poolIndex,
        };

        // Set the pending data before making the request
        dispatch(setLiquidityPending(request));

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
                props.cachedFetchTokenPrice,
            )
                .then((liqCurve) => {
                    if (liqCurve) {
                        dispatch(setLiquidity(liqCurve));
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
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals, // Token contract decimals
        quoteTokenDecimals, // Token contract decimals
        mainnetBaseTokenAddress, // The mainnet equivalent base token (if testnet)
        mainnetQuoteTokenAddress, // The mainnet euquivalent quote token
        isTokenABase, // True if the base token is the first token in the panel (e.g. sell token on swap)
    };
}
