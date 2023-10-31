import React, { createContext, useContext, useEffect } from 'react';
import { fetchUserRecentChanges } from '../App/functions/fetchUserRecentChanges';
import { getLimitOrderData } from '../App/functions/getLimitOrderData';
import { getPositionData } from '../App/functions/getPositionData';
import useDebounce from '../App/hooks/useDebounce';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../constants';
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

interface GraphDataContextIF {
    positionsByUser: PositionsByUser;
    limitOrdersByUser: LimitOrdersByUser;
    changesByUser: Changes;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    changesByPool: Changes;
    setChangesByPool: React.Dispatch<React.SetStateAction<Changes>>;
    setChangesByUser: React.Dispatch<React.SetStateAction<Changes>>;
    setUserPositionsByPool: React.Dispatch<
        React.SetStateAction<PositionsByPool>
    >;
    setPositionsByPool: React.Dispatch<React.SetStateAction<PositionsByPool>>;
    setLeaderboardByPool: React.Dispatch<React.SetStateAction<PositionsByPool>>;
    resetUserGraphData: () => void;
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
    const { crocEnv, provider, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const userLimitOrderStatesCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/user_limit_orders?';

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(lastBlockNumber, 2000);
    useEffect(() => {
        resetUserGraphData();
    }, [isUserConnected, userAddress]);

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

            const userPositionsCacheEndpoint =
                GRAPHCACHE_SMALL_URL + '/user_positions?';

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
    };

    return (
        <GraphDataContext.Provider value={graphDataContext}>
            {props.children}
        </GraphDataContext.Provider>
    );
};
