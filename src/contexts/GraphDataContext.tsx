import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { fetchRecords, fetchUserRecentChanges } from '../ambient-utils/api';
import { getPositionHash } from '../ambient-utils/dataLayer/functions/getPositionHash';
import {
    LimitOrderIF,
    LiquidityDataIF,
    PositionIF,
    RecordType,
    TokenIF,
    TransactionIF,
} from '../ambient-utils/types';
import {
    Changes,
    GraphDataContextIF,
    LimitOrdersByPool,
    LimitOrdersByUser,
    PoolRequestParams,
    PositionsByPool,
    PositionsByUser,
    PositionUpdateIF,
} from '../ambient-utils/types/contextTypes';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { DataLoadingContext } from './DataLoadingContext';
import { ReceiptContext } from './ReceiptContext';
import { TokenContext } from './TokenContext';
import { TradeDataContext } from './TradeDataContext';
import { UserDataContext } from './UserDataContext';

function normalizeAddr(addr: string): string {
    const caseAddr = addr.toLowerCase();
    return caseAddr.startsWith('0x') ? caseAddr : '0x' + caseAddr;
}

export const GraphDataContext = createContext({} as GraphDataContextIF);

export const GraphDataContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { GCGO_URL, chainId },
        server: { isEnabled: isServerEnabled },
        isUserIdle,
        isUserOnline,
    } = useContext(AppStateContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const { pendingTransactions, allReceipts, sessionPositionUpdates } =
        useContext(ReceiptContext);
    const { setDataLoadingStatus } = useContext(DataLoadingContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { userAddress: userDefaultAddress, isUserConnected } =
        useContext(UserDataContext);

    const [positionsByUser, setPositionsByUser] = useState<PositionsByUser>({
        dataReceived: false,
        positions: [],
    });
    const [limitOrdersByUser, setLimitOrdersByUser] =
        useState<LimitOrdersByUser>({
            dataReceived: false,
            limitOrders: [],
        });
    const [transactionsByUser, setTransactionsByUser] = useState<Changes>({
        dataReceived: false,
        changes: [],
    });
    const [userPositionsByPool, setUserPositionsByPool] =
        useState<PositionsByPool>({
            dataReceived: false,
            positions: [],
        });
    const [userTransactionsByPool, setUserTransactionsByPool] =
        useState<Changes>({
            dataReceived: false,
            changes: [],
        });

    const [positionsByPool, setPositionsByPool] = useState<PositionsByPool>({
        dataReceived: false,
        positions: [],
    });
    const [transactionsByPool, setTransactionsByPool] = useState<Changes>({
        dataReceived: false,
        changes: [],
    });

    const [userLimitOrdersByPool, setUserLimitOrdersByPool] =
        useState<LimitOrdersByPool>({
            dataReceived: false,
            limitOrders: [],
        });
    const [limitOrdersByPool, setLimitOrdersByPool] =
        useState<LimitOrdersByPool>({
            dataReceived: false,
            limitOrders: [],
        });

    const [liquidityData, setLiquidityData] = useState<
        LiquidityDataIF | undefined
    >(undefined);

    const [liquidityFee, setLiquidityFee] = useState<number | undefined>();

    const userAddress = userDefaultAddress;

    const resetUserGraphData = () => {
        setPositionsByUser({
            dataReceived: false,
            positions: [],
        });
        setLimitOrdersByUser({
            dataReceived: false,
            limitOrders: [],
        });
        setTransactionsByUser({
            dataReceived: false,
            changes: [],
        });
        setUserPositionsByPool({
            dataReceived: false,
            positions: [],
        });
        setUserLimitOrdersByPool({
            dataReceived: false,
            limitOrders: [],
        });
        setUserTransactionsByPool({
            dataReceived: false,
            changes: [],
        });
        setSessionTransactionHashes([]);
    };

    const resetPoolGraphData = () => {
        setTransactionsByPool({
            dataReceived: false,
            changes: [],
        });
        setPositionsByPool({
            dataReceived: false,
            positions: [],
        });
        setLimitOrdersByPool({
            dataReceived: false,
            limitOrders: [],
        });
    };

    const setLiquidity = (
        liqData: LiquidityDataIF,
        request: PoolRequestParams | undefined,
    ) => {
        // Sanitize the raw result from the backend
        const base = normalizeAddr(liqData.curveState.base);
        const quote = normalizeAddr(liqData.curveState.quote);
        const chainId = liqData.curveState.chainId;
        const curveState = { ...liqData.curveState, base, quote, chainId };

        // Verify that the result matches the current request in case multiple are in-flight
        if (
            request?.baseAddress.toLowerCase() === base &&
            request?.quoteAddress.toLowerCase() === quote &&
            request?.poolIndex === liqData.curveState.poolIdx &&
            request?.chainId === chainId
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

    const [sessionTransactionHashes, setSessionTransactionHashes] = useState<
        string[]
    >([]);

    useEffect(() => {
        if (isUserOnline) {
            resetUserGraphData();
        }
    }, [userAddress]);

    useEffect(() => {
        if (isUserOnline) {
            resetPoolGraphData();
        }
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        setUserPositionsByPool({
            dataReceived: false,
            positions: [],
        });
        setUserLimitOrdersByPool({
            dataReceived: false,
            limitOrders: [],
        });
        setUserTransactionsByPool({
            dataReceived: false,
            changes: [],
        });
    }, [baseToken.address + quoteToken.address]);

    const txsByUserHashArray = useMemo(
        () =>
            transactionsByUser.changes
                .concat(userTransactionsByPool.changes)
                .map((change) => change.txHash),
        [transactionsByUser, userTransactionsByPool],
    );

    const positionsByUserIndexUpdateArray: PositionUpdateIF[] = useMemo(
        () =>
            positionsByUser.positions
                .concat(userPositionsByPool.positions)
                .map((position) => {
                    return {
                        positionID: getPositionHash(position),
                        isLimit: false,
                        unixTimeIndexed: position.latestUpdateTime,
                    };
                }),
        [positionsByUser, userPositionsByPool],
    );

    const limitOrdersByUserIndexUpdateArray: PositionUpdateIF[] = useMemo(
        () =>
            limitOrdersByUser.limitOrders
                .concat(userLimitOrdersByPool.limitOrders)
                .map((limitOrder) => {
                    const posHash = getPositionHash(undefined, {
                        isPositionTypeAmbient: false,
                        user: limitOrder.user,
                        baseAddress: limitOrder.base,
                        quoteAddress: limitOrder.quote,
                        poolIdx: limitOrder.poolIdx,
                        bidTick: limitOrder.bidTick,
                        askTick: limitOrder.askTick,
                    });
                    return {
                        positionID: posHash,
                        isLimit: true,
                        unixTimeIndexed: limitOrder.latestUpdateTime,
                    };
                }),
        [limitOrdersByUser, userLimitOrdersByPool],
    );

    useEffect(() => {
        for (let i = 0; i < pendingTransactions.length; i++) {
            const pendingTx = pendingTransactions[i];
            setSessionTransactionHashes((prev) => {
                if (!prev.includes(pendingTx)) {
                    return [pendingTx, ...prev];
                } else return prev;
            });
        }
    }, [pendingTransactions]);

    const unindexedSessionTransactionHashes = sessionTransactionHashes.filter(
        (tx) => !txsByUserHashArray.includes(tx),
    );

    const failedSessionTransactionHashes = allReceipts
        .filter((r) => JSON.parse(r).status === 0)
        .map((r) => JSON.parse(r).hash);

    const unixTimeOffset = 10; // 10s offset needed to account for system clock differences

    // transaction hashes for subsequently fully removed positions
    const removedPositionUpdateTxHashes = useMemo(
        () =>
            sessionPositionUpdates
                .filter((pos1) =>
                    sessionPositionUpdates.some((pos2) => {
                        return (
                            pos1.positionID === pos2.positionID &&
                            pos2.isFullRemoval &&
                            (pos2.unixTimeReceipt || 0) >
                                (pos1.unixTimeAdded || 0)
                        );
                    }),
                )
                .map((removedTx) => removedTx.txHash),
        [sessionPositionUpdates],
    );

    const unindexedNonFailedSessionTransactionHashes = useMemo(
        () =>
            unindexedSessionTransactionHashes.filter(
                (tx) => !failedSessionTransactionHashes.includes(tx),
            ),
        [unindexedSessionTransactionHashes, failedSessionTransactionHashes],
    );

    const unindexedNonFailedSessionPositionUpdates = useMemo(
        () =>
            sessionPositionUpdates.filter(
                (positionUpdate) =>
                    positionUpdate.isLimit === false &&
                    !failedSessionTransactionHashes.includes(
                        positionUpdate.txHash,
                    ) &&
                    !removedPositionUpdateTxHashes.includes(
                        positionUpdate.txHash,
                    ) &&
                    !positionsByUserIndexUpdateArray.some(
                        (userPositionIndexUpdate) =>
                            userPositionIndexUpdate.positionID ===
                                positionUpdate.positionID &&
                            (userPositionIndexUpdate.unixTimeIndexed || 0) +
                                unixTimeOffset >=
                                (positionUpdate.unixTimeAdded || 0),
                    ),
            ),
        [
            sessionPositionUpdates,
            failedSessionTransactionHashes,
            removedPositionUpdateTxHashes,
            positionsByUserIndexUpdateArray,
        ],
    );

    const unindexedNonFailedSessionLimitOrderUpdates = useMemo(
        () =>
            sessionPositionUpdates.filter(
                (positionUpdate) =>
                    positionUpdate.isLimit === true &&
                    !failedSessionTransactionHashes.includes(
                        positionUpdate.txHash,
                    ) &&
                    !removedPositionUpdateTxHashes.includes(
                        positionUpdate.txHash,
                    ) &&
                    !limitOrdersByUserIndexUpdateArray.some(
                        (userPositionIndexUpdate) =>
                            userPositionIndexUpdate.positionID ===
                                positionUpdate.positionID &&
                            (userPositionIndexUpdate.unixTimeIndexed || 0) +
                                unixTimeOffset >=
                                (positionUpdate.unixTimeAdded || 0),
                    ),
            ),
        [
            sessionPositionUpdates,
            failedSessionTransactionHashes,
            limitOrdersByUserIndexUpdateArray,
        ],
    );

    const onAccountRoute = location.pathname.includes('account');

    const userDataByPoolLength = useMemo(
        () =>
            transactionsByUser.changes.length +
            userLimitOrdersByPool.limitOrders.length +
            userPositionsByPool.positions.length,
        [transactionsByUser, userLimitOrdersByPool, userPositionsByPool],
    );

    useEffect(() => {
        const fetchData = async () => {
            // This useEffect controls a series of other dispatches that fetch data on update of the user object
            // user Postions, limit orders, and recent changes are all governed here
            if (
                !isUserOnline ||
                !isServerEnabled ||
                !isUserConnected ||
                !userAddress ||
                !crocEnv ||
                !provider ||
                !tokens.tokenUniv.length ||
                !chainId ||
                (await crocEnv.context).chain.chainId !== chainId
            ) {
                return;
            }
            const recordTargets = [RecordType.Position, RecordType.LimitOrder];
            for (let i = 0; i < recordTargets.length; i++) {
                try {
                    const updatedLedger = await fetchRecords({
                        recordType: recordTargets[i],
                        user: userAddress,
                        chainId: chainId,
                        gcUrl: GCGO_URL,
                        provider,
                        tokenUniv: tokens.tokenUniv,
                        crocEnv,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                    });

                    if (recordTargets[i] == RecordType.Position) {
                        setPositionsByUser({
                            dataReceived: true,
                            positions: updatedLedger as PositionIF[],
                        });
                        setDataLoadingStatus({
                            datasetName: 'isConnectedUserRangeDataLoading',
                            loadingStatus: false,
                        });
                    } else {
                        // default user_positions
                        setLimitOrdersByUser({
                            dataReceived: true,
                            limitOrders: updatedLedger as LimitOrderIF[],
                        }),
                            setDataLoadingStatus({
                                datasetName: 'isConnectedUserOrderDataLoading',
                                loadingStatus: false,
                            });
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            try {
                fetchUserRecentChanges({
                    tokenList: tokens.tokenUniv,
                    user: userAddress,
                    chainId: chainId,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider,
                    n: 100, // fetch last 100 changes,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                })
                    .then((updatedTransactions) => {
                        if (updatedTransactions) {
                            setTransactionsByUser({
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
        };
        fetchData();
    }, [
        isUserOnline,
        isServerEnabled,
        tokens.tokenUniv.length,
        isUserConnected,
        userAddress,
        chainId,
        isUserIdle
            ? Math.floor(Date.now() / (onAccountRoute ? 60000 : 120000))
            : Math.floor(Date.now() / (onAccountRoute ? 15000 : 60000)), // cache every 15 seconds while viewing portfolio, otherwise 1 minute
        crocEnv,
        provider,
        userDataByPoolLength,
        allReceipts.length,
    ]);

    const graphDataContext: GraphDataContextIF = {
        positionsByUser,
        limitOrdersByUser,
        transactionsByUser,
        userPositionsByPool,
        userTransactionsByPool,
        unindexedNonFailedSessionTransactionHashes,
        unindexedNonFailedSessionPositionUpdates,
        unindexedNonFailedSessionLimitOrderUpdates,
        resetUserGraphData,
        setTransactionsByUser,
        setUserPositionsByPool,
        setUserTransactionsByPool,
        positionsByPool,
        setPositionsByPool,
        transactionsByPool,
        setTransactionsByPool,
        userLimitOrdersByPool,
        setUserLimitOrdersByPool,
        limitOrdersByPool,
        setLimitOrdersByPool,
        liquidityData,
        setLiquidity,
        liquidityFee,
        setLiquidityFee,
    };

    return (
        <GraphDataContext.Provider value={graphDataContext}>
            {props.children}
        </GraphDataContext.Provider>
    );
};
