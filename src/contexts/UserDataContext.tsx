import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAccount } from 'wagmi';
import { fetchUserRecentChanges } from '../App/functions/fetchUserRecentChanges';
import { getLimitOrderData } from '../App/functions/getLimitOrderData';
import { getPositionData } from '../App/functions/getPositionData';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../constants';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { LimitOrderIF } from '../utils/interfaces/LimitOrderIF';
import { PositionIF } from '../utils/interfaces/PositionIF';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { TransactionIF } from '../utils/interfaces/TransactionIF';
import {
    resetConnectedUserDataLoadingStatus,
    resetUserGraphData,
    setChangesByUser,
    setDataLoadingStatus,
    setLimitOrdersByUser,
    setPositionsByUser,
} from '../utils/state/graphDataSlice';
import {
    setIsLoggedIn,
    setAddressCurrent,
    resetUserAddresses,
    resetTokenData,
    setRecentTokens,
} from '../utils/state/userDataSlice';
import { AppStateContext } from './AppStateContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';

// TODO: userData redux goes in here
export const UserDataContext = createContext({});

export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const dispatch = useDispatch();
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { isLoggedIn } = useAppSelector((state) => state.userData);
    const { address: userAddress, isConnected } = useAccount();

    // TODO: Wagmi isConnected === userData.isLoggedIn - can consolidate and use either as source of truth && Wagmi address === useData.userAddress
    useEffect(() => {
        if (isConnected) {
            if (isLoggedIn === false && userAddress) {
                IS_LOCAL_ENV && console.debug('settting to logged in');
                dispatch(setIsLoggedIn(true));
                dispatch(setAddressCurrent(userAddress));
            } else if (isLoggedIn === false) {
                IS_LOCAL_ENV &&
                    console.debug('settting to logged in - no address');
                dispatch(setIsLoggedIn(true));
            } else if (isLoggedIn === undefined) {
                IS_LOCAL_ENV && console.debug('settting to logged out');
                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        } else {
            if (isLoggedIn === true) {
                IS_LOCAL_ENV && console.debug('settting to logged out');
                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        }
        dispatch(resetTokenData());
        dispatch(resetUserGraphData());
    }, [isConnected, isLoggedIn, userAddress]);

    // CONTEXT: user data context
    const userLimitOrderStatesCacheEndpoint =
        GRAPHCACHE_URL + '/user_limit_order_states?';
    useEffect(() => {
        if (isServerEnabled && isConnected && userAddress && crocEnv) {
            dispatch(resetConnectedUserDataLoadingStatus());

            IS_LOCAL_ENV && console.debug('fetching user positions');

            const userPositionsCacheEndpoint =
                GRAPHCACHE_URL + '/user_positions?';

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

                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserRangeData',
                                loadingStatus: false,
                            }),
                        );

                        if (userPositions && crocEnv) {
                            Promise.all(
                                userPositions.map((position: PositionIF) => {
                                    return getPositionData(
                                        position,
                                        tokens.tokenUniv,
                                        crocEnv,
                                        chainData.chainId,
                                        lastBlockNumber,
                                    );
                                }),
                            ).then((updatedPositions) => {
                                dispatch(
                                    setPositionsByUser({
                                        dataReceived: true,
                                        positions: updatedPositions,
                                    }),
                                );
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
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'connectedUserOrderData',
                            loadingStatus: false,
                        }),
                    );
                    if (userLimitOrderStates) {
                        Promise.all(
                            userLimitOrderStates.map(
                                (limitOrder: LimitOrderIF) => {
                                    return getLimitOrderData(
                                        limitOrder,
                                        tokens.tokenUniv,
                                    );
                                },
                            ),
                        ).then((updatedLimitOrderStates) => {
                            dispatch(
                                setLimitOrdersByUser({
                                    dataReceived: true,
                                    limitOrders: updatedLimitOrderStates,
                                }),
                            );
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
                    n: 100, // fetch last 100 changes,
                })
                    .then((updatedTransactions) => {
                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserTxData',
                                loadingStatus: false,
                            }),
                        );
                        if (updatedTransactions) {
                            dispatch(
                                setChangesByUser({
                                    dataReceived: true,
                                    changes: updatedTransactions,
                                }),
                            );
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
                            dispatch(setRecentTokens(result));
                        }
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }
        }
    }, [
        isServerEnabled,
        tokens.tokenUniv,
        isConnected,
        userAddress,
        chainData.chainId,
        crocEnv,
    ]);

    return (
        <UserDataContext.Provider value={{}}>
            {props.children}
        </UserDataContext.Provider>
    );
};
