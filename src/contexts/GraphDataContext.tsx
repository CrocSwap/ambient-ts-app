import React, { createContext, useContext, useEffect } from 'react';
import { fetchUserRecentChanges, fetchRecords } from '../ambient-utils/api';
import useDebounce from '../App/hooks/useDebounce';
import {
    TokenIF,
    PositionIF,
    LimitOrderIF,
    TransactionIF,
    LiquidityDataIF,
    RecordType,
} from '../ambient-utils/types';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';
import { UserDataContext } from './UserDataContext';
import { DataLoadingContext } from './DataLoadingContext';
import { PositionUpdateIF, ReceiptContext } from './ReceiptContext';
import { getPositionHash } from '../ambient-utils/dataLayer/functions/getPositionHash';
import { TradeDataContext } from './TradeDataContext';

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
    transactionsByUser: Changes;
    userTransactionsByPool: Changes;
    unindexedNonFailedSessionTransactionHashes: string[];
    unindexedNonFailedSessionPositionUpdates: PositionUpdateIF[];
    unindexedNonFailedSessionLimitOrderUpdates: PositionUpdateIF[];
    transactionsByPool: Changes;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    leaderboardByPool: PositionsByPool;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
    liquidityData: LiquidityDataIF | undefined;
    liquidityFee: number;

    setLiquidityPending: (params: PoolRequestParams) => void;
    setLiquidity: (
        liqData: LiquidityDataIF,
        request: PoolRequestParams | undefined,
    ) => void;
    setLiquidityFee: React.Dispatch<React.SetStateAction<number>>;
    setTransactionsByPool: React.Dispatch<React.SetStateAction<Changes>>;
    setTransactionsByUser: React.Dispatch<React.SetStateAction<Changes>>;
    setUserTransactionsByPool: React.Dispatch<React.SetStateAction<Changes>>;
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
    const [transactionsByUser, setTransactionsByUser] = React.useState<Changes>(
        {
            dataReceived: false,
            changes: [],
        },
    );
    const [userPositionsByPool, setUserPositionsByPool] =
        React.useState<PositionsByPool>({
            dataReceived: false,
            positions: [],
        });
    const [userTransactionsByPool, setUserTransactionsByPool] =
        React.useState<Changes>({
            dataReceived: false,
            changes: [],
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
    const [transactionsByPool, setTransactionsByPool] = React.useState<Changes>(
        {
            dataReceived: false,
            changes: [],
        },
    );
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

    const [liquidityFee, setLiquidityFee] = React.useState<number>(0);
    const {
        server: { isEnabled: isServerEnabled },
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
    const { crocEnv, provider, chainData, activeNetwork } =
        useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress: userDefaultAddress, isUserConnected } =
        useContext(UserDataContext);
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

    const setLiquidityPending = () => {
        setLiquidityData(undefined);
    };

    const [sessionTransactionHashes, setSessionTransactionHashes] =
        React.useState<string[]>([]);

    useEffect(() => {
        resetUserGraphData();
    }, [isUserConnected, userAddress]);

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

    const userTxByPoolHashArray = userTransactionsByPool.changes.map(
        (change) => change.txHash,
    );

    const userPositionsByPoolIndexUpdateArray: PositionUpdateIF[] =
        userPositionsByPool.positions.map((position) => {
            return {
                positionID: getPositionHash(position),
                isLimit: false,
                unixTimeIndexed: position.latestUpdateTime,
            };
        });

    const userLimitOrdersByPoolIndexUpdateArray: PositionUpdateIF[] =
        userLimitOrdersByPool.limitOrders.map((limitOrder) => {
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
        });

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
        (tx) => !userTxByPoolHashArray.includes(tx),
    );

    const failedSessionTransactionHashes = allReceipts
        .filter((r) => JSON.parse(r).status === 0)
        .map((r) => JSON.parse(r).transactionHash);

    // transaction hashes for subsequently fully removed positions
    const removedPositionUpdateTxHashes = sessionPositionUpdates
        .filter((pos1) =>
            sessionPositionUpdates.some((pos2) => {
                return (
                    pos1.positionID === pos2.positionID &&
                    pos2.isFullRemoval &&
                    (pos2.unixTimeReceipt || 0) > (pos1.unixTimeAdded || 0)
                );
            }),
        )
        .map((removedTx) => removedTx.txHash);

    const unindexedNonFailedSessionTransactionHashes =
        unindexedSessionTransactionHashes.filter(
            (tx) => !failedSessionTransactionHashes.includes(tx),
        );

    const unindexedNonFailedSessionPositionUpdates =
        sessionPositionUpdates.filter(
            (positionUpdate) =>
                positionUpdate.isLimit === false &&
                !failedSessionTransactionHashes.includes(
                    positionUpdate.txHash,
                ) &&
                !removedPositionUpdateTxHashes.includes(
                    positionUpdate.txHash,
                ) &&
                !userPositionsByPoolIndexUpdateArray.some(
                    (userPositionIndexUpdate) =>
                        userPositionIndexUpdate.positionID ===
                            positionUpdate.positionID &&
                        (userPositionIndexUpdate.unixTimeIndexed || 0) >
                            (positionUpdate.unixTimeAdded || 0),
                ),
        );

    const unindexedNonFailedSessionLimitOrderUpdates =
        sessionPositionUpdates.filter(
            (positionUpdate) =>
                positionUpdate.isLimit === true &&
                !failedSessionTransactionHashes.includes(
                    positionUpdate.txHash,
                ) &&
                !removedPositionUpdateTxHashes.includes(
                    positionUpdate.txHash,
                ) &&
                !userLimitOrdersByPoolIndexUpdateArray.some(
                    (userPositionIndexUpdate) =>
                        userPositionIndexUpdate.positionID ===
                            positionUpdate.positionID &&
                        (userPositionIndexUpdate.unixTimeIndexed || 0) >
                            (positionUpdate.unixTimeAdded || 0),
                ),
        );

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(lastBlockNumber, 2000);

    useEffect(() => {
        const fetchData = async () => {
            // This useEffect controls a series of other dispatches that fetch data on update of the user object
            // user Postions, limit orders, and recent changes are all governed here
            if (
                !isServerEnabled ||
                !isUserConnected ||
                !userAddress ||
                !crocEnv ||
                !provider ||
                !tokens.tokenUniv.length ||
                !chainData.chainId
            ) {
                return;
            }
            const recordTargets = [RecordType.Position, RecordType.LimitOrder];
            for (let i = 0; i < recordTargets.length; i++) {
                try {
                    const updatedLedger = await fetchRecords({
                        recordType: recordTargets[i],
                        user: userAddress,
                        chainId: chainData.chainId,
                        gcUrl: activeNetwork.graphCacheUrl,
                        provider,
                        lastBlockNumber,
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
        leaderboardByPool,
        setPositionsByPool,
        setLeaderboardByPool,
        transactionsByPool,
        setTransactionsByPool,
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
