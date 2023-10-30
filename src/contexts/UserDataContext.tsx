import React, {
    createContext,
    useContext,
    useEffect,
    Dispatch,
    SetStateAction,
} from 'react';
import { useDispatch } from 'react-redux';
import { useAccount, useDisconnect, useConnect, useEnsName } from 'wagmi';
import { fetchUserRecentChanges } from '../App/functions/fetchUserRecentChanges';
import { getLimitOrderData } from '../App/functions/getLimitOrderData';
import { getPositionData } from '../App/functions/getPositionData';
import useDebounce from '../App/hooks/useDebounce';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../constants';
import { LimitOrderServerIF } from '../utils/interfaces/LimitOrderIF';
import { PositionServerIF } from '../utils/interfaces/PositionIF';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { TransactionIF } from '../utils/interfaces/TransactionIF';
import {
    resetUserGraphData,
    setChangesByUser,
    setDataLoadingStatus,
    setLimitOrdersByUser,
    setPositionsByUser,
} from '../utils/state/graphDataSlice';

import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';
import { checkBlacklist } from '../utils/data/blacklist';
import { ConnectArgs, Connector } from '@wagmi/core';

interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    disconnectUser: () => void;
    connectUser: (args?: Partial<ConnectArgs> | undefined) => void;
    connectError: Error | null;
    connectIsLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectors: Connector<any, any, any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingConnector: Connector<any, any, any> | undefined;

    ensName: string | null | undefined;
    resolvedAddressFromContext: string;
    setResolvedAddressInContext: Dispatch<SetStateAction<string>>;
}
export const UserDataContext = createContext<UserDataContextIF>(
    {} as UserDataContextIF,
);

export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [resolvedAddressFromContext, setResolvedAddressInContext] =
        React.useState<string>('');

    const dispatch = useDispatch();
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv, provider, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber, resetTokenBalances } =
        useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { address: userAddress, isConnected: isUserConnected } = useAccount();
    const { disconnect: disconnectUser } = useDisconnect();
    const {
        connect: connectUser,
        connectors,
        error: connectError,
        isLoading: connectIsLoading,
        pendingConnector,
    } = useConnect({
        onSettled(data, error) {
            if (error) console.error({ error });
            const connectedAddress = data?.account;
            const isBlacklisted = connectedAddress
                ? checkBlacklist(connectedAddress)
                : false;
            if (isBlacklisted) disconnectUser();
        },
    });
    const { data: ensName } = useEnsName({ address: userAddress });

    useEffect(() => {
        resetTokenBalances();
        dispatch(resetUserGraphData());
    }, [isUserConnected, userAddress]);

    const userLimitOrderStatesCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/user_limit_orders?';

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
                                dispatch(
                                    setPositionsByUser({
                                        dataReceived: true,
                                        positions: updatedPositions,
                                    }),
                                );
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'connectedUserRangeData',
                                        loadingStatus: false,
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
                            dispatch(
                                setLimitOrdersByUser({
                                    dataReceived: true,
                                    limitOrders: updatedLimitOrderStates,
                                }),
                            );
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'connectedUserOrderData',
                                    loadingStatus: false,
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
                        }

                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserTxData',
                                loadingStatus: false,
                            }),
                        );
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

    const userDataContext: UserDataContextIF = {
        isUserConnected,
        userAddress,
        disconnectUser,
        ensName,
        connectUser,
        connectors,
        connectError,
        connectIsLoading,
        pendingConnector,

        resolvedAddressFromContext,
        setResolvedAddressInContext,
    };

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};
