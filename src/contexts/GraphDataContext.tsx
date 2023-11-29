import React, { createContext, useContext, useEffect } from 'react';
import { fetchUserRecentChanges } from '../App/functions/fetchUserRecentChanges';
import { getLimitOrderData } from '../App/functions/getLimitOrderData';
import { getPositionData } from '../App/functions/getPositionData';
import useDebounce from '../App/hooks/useDebounce';
import { GCGO_OVERRIDE_URL, IS_LOCAL_ENV } from '../constants';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../utils/interfaces/LimitOrderIF';
import { PositionIF, PositionServerIF } from '../utils/interfaces/PositionIF';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { TransactionIF } from '../utils/interfaces/TransactionIF';

import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';

import { UserDataContext } from './UserDataContext';
import { DataLoadingContext } from './DataLoadingContext';
import { LiquidityDataIF } from '../App/functions/fetchPoolLiquidity';

interface Changes {
    dataReceived: boolean;
    changes: Array<TransactionIF>;
}

interface PositionsByUser {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}
interface LimitOrdersByUser {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
}
interface PositionsByPool {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}
interface LimitOrdersByPool {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
}
interface PoolRequestParams {
    baseAddress: string;
    quoteAddress: string;
    poolIndex: number;
    chainId: string;
}

interface GraphDataContextIF {
    positionsByUser: PositionsByUser;
    limitOrdersByUser: LimitOrdersByUser;
    changesByUser: Changes;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    changesByPool: Changes;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
    liquidityData: LiquidityDataIF | undefined;
    liquidityFee: number;

    setLiquidityPending: (params: PoolRequestParams) => void;
    setLiquidity: (liqData: LiquidityDataIF) => void;
    setLiquidityFee: React.Dispatch<React.SetStateAction<number>>;
    setChangesByPool: React.Dispatch<React.SetStateAction<Changes>>;
    setChangesByUser: React.Dispatch<React.SetStateAction<Changes>>;
    setUserPositionsByPool: React.Dispatch<
        React.SetStateAction<PositionsByPool>
    >;
    setPositionsByPool: React.Dispatch<React.SetStateAction<PositionsByPool>>;
    setLeaderboardByPool: React.Dispatch<React.SetStateAction<PositionsByPool>>;
    setUserLimitOrdersByPool: React.Dispatch<
        React.SetStateAction<LimitOrdersByPool>
    >;
    setLimitOrdersByPool: React.Dispatch<
        React.SetStateAction<LimitOrdersByPool>
    >;
    resetUserGraphData: () => void;
}

function normalizeAddr(addr: string): string {
    const caseAddr = addr.toLowerCase();
    return caseAddr.startsWith('0x') ? caseAddr : '0x' + caseAddr;
}

export const GraphDataContext = createContext<GraphDataContextIF>(
    {} as GraphDataContextIF,
);

export const GraphDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [positionsByUser, setPositionsByUser] =
        React.useState<PositionsByUser>({
            dataReceived: false,
            positions: [],
        });
    const [limitOrdersByUser, setLimitOrdersByUser] =
        React.useState<LimitOrdersByUser>({
            dataReceived: false,
            limitOrders: [],
        });
    const [changesByUser, setChangesByUser] = React.useState<Changes>({
        dataReceived: false,
        changes: [],
    });
    const [userPositionsByPool, setUserPositionsByPool] =
        React.useState<PositionsByPool>({
            dataReceived: false,
            positions: [],
        });

    const [positionsByPool, setPositionsByPool] =
        React.useState<PositionsByPool>({
            dataReceived: false,
            positions: [],
        });
    const [leaderboardByPool, setLeaderboardByPool] =
        React.useState<PositionsByPool>({
            dataReceived: false,
            positions: [],
        });
    const [changesByPool, setChangesByPool] = React.useState<Changes>({
        dataReceived: false,
        changes: [],
    });
    const [userLimitOrdersByPool, setUserLimitOrdersByPool] =
        React.useState<LimitOrdersByPool>({
            dataReceived: false,
            limitOrders: [],
        });
    const [limitOrdersByPool, setLimitOrdersByPool] =
        React.useState<LimitOrdersByPool>({
            dataReceived: false,
            limitOrders: [],
        });

    const [liquidityData, setLiquidityData] = React.useState<
        LiquidityDataIF | undefined
    >(undefined);

    const [liquidityRequest, setLiquidityRequest] = React.useState<
        PoolRequestParams | undefined
    >(undefined);
    const [liquidityFee, setLiquidityFee] = React.useState<number>(0);
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);

    const { setDataLoadingStatus } = useContext(DataLoadingContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv, provider, chainData, activeNetwork } =
        useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const userLimitOrderStatesCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_limit_orders?'
        : activeNetwork.graphCacheUrl + '/user_limit_orders?';

    const userPositionsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_positions?'
        : activeNetwork.graphCacheUrl + '/user_positions?';

    const resetUserGraphData = () => {
        setPositionsByUser({
            dataReceived: false,
            positions: [],
        });
        setLimitOrdersByUser({
            dataReceived: false,
            limitOrders: [],
        });
        setChangesByUser({
            dataReceived: false,
            changes: [],
        });
    };

    const setLiquidity = (liqData: LiquidityDataIF) => {
        // Sanitize the raw result from the backend
        const base = normalizeAddr(liqData.curveState.base);
        const quote = normalizeAddr(liqData.curveState.quote);
        const chainId = liqData.curveState.chainId;
        const curveState = { ...liqData.curveState, base, quote, chainId };

        // Verify that the result matches the current request in case multiple are in-flight
        if (
            liquidityRequest?.baseAddress.toLowerCase() === base &&
            liquidityRequest?.quoteAddress.toLowerCase() === quote &&
            liquidityRequest?.poolIndex === liqData.curveState.poolIdx &&
            liquidityRequest?.chainId === chainId
        ) {
            setLiquidityData({ ...liqData, curveState });
        } else {
            console.warn(
                'Discarding mismatched liquidity curve request',
                base,
                quote,
                chainId,
            );
        }
    };

    const setLiquidityPending = (params: PoolRequestParams) => {
        setLiquidityRequest(params);
        setLiquidityData(undefined);
    };

    useEffect(() => {
        resetUserGraphData();
    }, [isUserConnected, userAddress]);

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(lastBlockNumber, 2000);

    useEffect(() => {
        // This useEffect controls a series of other dispatches that fetch data on update of the user object
        // user Postions, limit orders, and recent changes are all governed here
        if (
            isServerEnabled &&
            isUserConnected &&
            userAddress &&
            crocEnv &&
            provider &&
            tokens.tokenUniv.length &&
            chainData.chainId
        ) {
            IS_LOCAL_ENV && console.debug('fetching user positions');

            try {
                fetch(
                    userPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: userAddress,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                            annotate: 'true',
                            omitKnockout: 'true',
                            addValue: 'true',
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        // temporarily skip ENS fetch
                        const skipENSFetch = true;
                        const userPositions = json?.data;
                        if (userPositions && crocEnv) {
                            Promise.all(
                                userPositions.map(
                                    (position: PositionServerIF) => {
                                        return getPositionData(
                                            position,
                                            tokens.tokenUniv,
                                            crocEnv,
                                            provider,
                                            chainData.chainId,
                                            lastBlockNumber,
                                            cachedFetchTokenPrice,
                                            cachedQuerySpotPrice,
                                            cachedTokenDetails,
                                            cachedEnsResolve,
                                            skipENSFetch,
                                        );
                                    },
                                ),
                            ).then((updatedPositions) => {
                                setPositionsByUser({
                                    dataReceived: true,
                                    positions: updatedPositions,
                                }),
                                    setDataLoadingStatus({
                                        datasetName:
                                            'isConnectedUserRangeDataLoading',
                                        loadingStatus: false,
                                    });
                            });
                        }
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }

            IS_LOCAL_ENV && console.debug('fetching user limit orders ');

            fetch(
                userLimitOrderStatesCacheEndpoint +
                    new URLSearchParams({
                        user: userAddress,
                        chainId: chainData.chainId,
                        ensResolution: 'true',
                        omitEmpty: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    // temporarily skip ENS fetch
                    const skipENSFetch = true;
                    const userLimitOrderStates = json?.data;
                    if (userLimitOrderStates) {
                        Promise.all(
                            userLimitOrderStates.map(
                                (limitOrder: LimitOrderServerIF) => {
                                    return getLimitOrderData(
                                        limitOrder,
                                        tokens.tokenUniv,
                                        crocEnv,
                                        provider,
                                        chainData.chainId,
                                        lastBlockNumber,
                                        cachedFetchTokenPrice,
                                        cachedQuerySpotPrice,
                                        cachedTokenDetails,
                                        cachedEnsResolve,
                                        skipENSFetch,
                                    );
                                },
                            ),
                        ).then((updatedLimitOrderStates) => {
                            setLimitOrdersByUser({
                                dataReceived: true,
                                limitOrders: updatedLimitOrderStates,
                            }),
                                setDataLoadingStatus({
                                    datasetName:
                                        'isConnectedUserOrderDataLoading',
                                    loadingStatus: false,
                                });
                        });
                    }
                })
                .catch(console.error);

            try {
                fetchUserRecentChanges({
                    tokenList: tokens.tokenUniv,
                    user: userAddress,
                    chainId: chainData.chainId,
                    annotate: true,
                    addValue: true,
                    simpleCalc: true,
                    annotateMEV: false,
                    ensResolution: true,
                    crocEnv: crocEnv,
                    graphCacheUrl: activeNetwork.graphCacheUrl,
                    provider,
                    lastBlockNumber: lastBlockNumber,
                    n: 100, // fetch last 100 changes,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                })
                    .then((updatedTransactions) => {
                        if (updatedTransactions) {
                            setChangesByUser({
                                dataReceived: true,
                                changes: updatedTransactions,
                            });
                            const result: TokenIF[] = [];
                            const tokenMap = new Map();
                            for (const item of updatedTransactions as TransactionIF[]) {
                                if (!tokenMap.has(item.base)) {
                                    const isFoundInAmbientList =
                                        tokens.defaultTokens.some(
                                            (ambientToken) => {
                                                if (
                                                    ambientToken.address.toLowerCase() ===
                                                    item.base.toLowerCase()
                                                )
                                                    return true;
                                                return false;
                                            },
                                        );
                                    if (!isFoundInAmbientList) {
                                        tokenMap.set(item.base, true); // set any value to Map
                                        result.push({
                                            name: item.baseName,
                                            address: item.base,
                                            symbol: item.baseSymbol,
                                            decimals: item.baseDecimals,
                                            chainId: parseInt(item.chainId),
                                            logoURI: item.baseTokenLogoURI,
                                        });
                                    }
                                }
                                if (!tokenMap.has(item.quote)) {
                                    const isFoundInAmbientList =
                                        tokens.defaultTokens.some(
                                            (ambientToken) => {
                                                if (
                                                    ambientToken.address.toLowerCase() ===
                                                    item.quote.toLowerCase()
                                                )
                                                    return true;
                                                return false;
                                            },
                                        );
                                    if (!isFoundInAmbientList) {
                                        tokenMap.set(item.quote, true); // set any value to Map
                                        result.push({
                                            name: item.quoteName,
                                            address: item.quote,
                                            symbol: item.quoteSymbol,
                                            decimals: item.quoteDecimals,
                                            chainId: parseInt(item.chainId),
                                            logoURI: item.quoteTokenLogoURI,
                                        });
                                    }
                                }
                            }
                        }

                        setDataLoadingStatus({
                            datasetName: 'isConnectedUserTxDataLoading',
                            loadingStatus: false,
                        });
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }
        }
    }, [
        isServerEnabled,
        tokens.tokenUniv.length,
        isUserConnected,
        userAddress,
        chainData.chainId,
        lastBlockNumWait,
        !!crocEnv,
        !!provider,
    ]);

    const graphDataContext: GraphDataContextIF = {
        positionsByUser,
        limitOrdersByUser,
        changesByUser,
        userPositionsByPool,
        resetUserGraphData,
        setChangesByUser,
        setUserPositionsByPool,
        positionsByPool,
        leaderboardByPool,
        setPositionsByPool,
        setLeaderboardByPool,
        changesByPool,
        setChangesByPool,
        userLimitOrdersByPool,
        setUserLimitOrdersByPool,
        limitOrdersByPool,
        setLimitOrdersByPool,
        liquidityData,
        setLiquidity,
        setLiquidityPending,
        liquidityFee,
        setLiquidityFee,
    };

    return (
        <GraphDataContext.Provider value={graphDataContext}>
            {props.children}
        </GraphDataContext.Provider>
    );
};
