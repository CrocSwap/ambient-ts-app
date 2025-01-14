/* eslint-disable no-irregular-whitespace */

import { useContext, useEffect, useMemo, useState } from 'react';
import { TransactionIF } from '../../../ambient-utils/types';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { PositionIF } from '../../../ambient-utils/types/position';
import {
    AppStateContext,
    GraphDataContext,
    TradeDataContext,
    UserDataContext,
} from '../../../contexts';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import useGenFakeTableRow from './useGenFakeTableRow';

export type RecentlyUpdatedPositionIF = {
    positionHash: string;
    timestamp: number;
    position: LimitOrderIF | PositionIF;
    type: string;
    action: string;
};

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: LimitOrderIF[] | PositionIF[] | TransactionIF[];
}

const useMergeWithPendingTxs = (props: propsIF) => {
    const { data, type } = props;

    const { transactionsByType } = useContext(ReceiptContext);
    const {
        unindexedNonFailedSessionLimitOrderUpdates,
        unindexedNonFailedSessionPositionUpdates,
    } = useContext(GraphDataContext);

    const { userAddress } = useContext(UserDataContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const [recentlyUpdatedPositions, setRecentlyUpdatedPositions] = useState<
        RecentlyUpdatedPositionIF[]
    >([]);

    const { genFakeLimitOrder, genFakePosition } = useGenFakeTableRow();

    const {
        activeNetwork: { poolIndex },
    } = useContext(AppStateContext);

    const [blackList, setBlackList] = useState<Set<string>>();

    const relevantTransactions = useMemo(() => {
        if (type === 'Order') {
            let relTxs = transactionsByType.filter(
                (tx) =>
                    // !tx.isRemoved &&
                    unindexedNonFailedSessionLimitOrderUpdates.some(
                        (update) => update.txHash === tx.txHash,
                    ) &&
                    tx.userAddress.toLowerCase() ===
                        (userAddress || '').toLowerCase() &&
                    tx.txDetails?.baseAddress.toLowerCase() ===
                        baseToken.address.toLowerCase() &&
                    tx.txDetails?.quoteAddress.toLowerCase() ===
                        quoteToken.address.toLowerCase() &&
                    tx.txDetails?.poolIdx === poolIndex,
            );

            relTxs = relTxs.filter((tx) => {
                return tx.txType === 'Limit';
            });

            return relTxs;
        } else if (type === 'Range') {
            let relTxs = transactionsByType.filter(
                (tx) =>
                    !tx.isRemoved &&
                    unindexedNonFailedSessionPositionUpdates.some(
                        (update) => update.txHash === tx.txHash,
                    ) &&
                    tx.userAddress.toLowerCase() ===
                        (userAddress || '').toLowerCase() &&
                    tx.txDetails?.baseAddress.toLowerCase() ===
                        baseToken.address.toLowerCase() &&
                    tx.txDetails?.quoteAddress.toLowerCase() ===
                        quoteToken.address.toLowerCase() &&
                    tx.txDetails?.poolIdx === poolIndex,
            );

            relTxs = relTxs.filter((tx) => {
                return (
                    tx.txAction === 'Add' ||
                    tx.txAction === 'Reposition' ||
                    tx.txAction === 'Remove' ||
                    tx.txAction === 'Harvest'
                );
            });

            return relTxs;
        }
    }, [
        type,
        transactionsByType,
        unindexedNonFailedSessionLimitOrderUpdates,
        unindexedNonFailedSessionPositionUpdates,
        baseToken,
        quoteToken,
        userAddress,
        poolIndex,
    ]);

    useEffect(() => {
        if (!relevantTransactions) {
            setRecentlyUpdatedPositions([]);
            return;
        }

        if (relevantTransactions.length === 0) {
            setRecentlyUpdatedPositions([]);
            return;
        }

        (async () => {
            if (type === 'Order') {
                Promise.all(
                    relevantTransactions.map((tx) => {
                        return genFakeLimitOrder(tx);
                    }),
                ).then((rows) => {
                    updateRelevantTransactions(rows);
                });
            } else if (type === 'Range') {
                Promise.all(
                    relevantTransactions.map((tx) => {
                        return genFakePosition(tx);
                    }),
                ).then((rows) => {
                    updateRelevantTransactions(rows);
                });
            }
        })();
    }, [relevantTransactions, type]);

    const updateRelevantTransactions = (
        recentRelevantTxs: RecentlyUpdatedPositionIF[],
    ) => {
        const recentRelevantTxsHashes = new Set(
            recentRelevantTxs.map((tx) => tx.positionHash),
        );

        // added to fix duplicated pending relevant txs
        const uniqueRelevantTxs: RecentlyUpdatedPositionIF[] = [];

        recentRelevantTxs.forEach((tx) => {
            if (
                !uniqueRelevantTxs.find(
                    (e) => e.positionHash === tx.positionHash,
                )
            ) {
                uniqueRelevantTxs.push(tx);
            }
        });

        setRecentlyUpdatedPositions((prev) => {
            return [
                ...prev.filter(
                    (e) => !recentRelevantTxsHashes.has(e.positionHash),
                ),
                ...uniqueRelevantTxs,
            ];
        });
    };

    const mergedData = useMemo(() => {
        const recentlyUpdatedHashes = new Set();
        const recentlyUpdatedToShow: LimitOrderIF[] | PositionIF[] = [];
        recentlyUpdatedPositions.forEach((e) => {
            const isFresh =
                Math.floor(e.timestamp / 1000) - Math.floor(Date.now() / 1000) <
                120;
            if (isFresh) {
                if (type === 'Order') {
                    if (
                        e.action !== 'Remove' &&
                        e.position.totalValueUSD > 0.01
                    ) {
                        (recentlyUpdatedToShow as LimitOrderIF[]).push(
                            e.position as LimitOrderIF,
                        );
                    } else {
                        setBlackList((prev) => {
                            return new Set([...(prev || []), e.positionHash]);
                        });
                    }
                } else if (props.type === 'Range') {
                    if (e.position.positionLiq > 0.01) {
                        (recentlyUpdatedToShow as PositionIF[]).push(
                            e.position as PositionIF,
                        );
                    } else {
                        setBlackList((prev) => {
                            return new Set([...(prev || []), e.positionHash]);
                        });
                    }
                }
                recentlyUpdatedHashes.add(e.positionHash);
            }
        });

        let clearedData: LimitOrderIF[] | PositionIF[] = [];
        if (type === 'Order') {
            clearedData = (data as LimitOrderIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionHash),
            );
            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as LimitOrderIF[];
        } else if (type === 'Range') {
            clearedData = (data as PositionIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionId),
            );
            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as PositionIF[];
        } else if (type === 'Transaction') {
            return (data as TransactionIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.txHash),
            ) as TransactionIF[];
        }

        return [];
    }, [type, data, recentlyUpdatedPositions]);

    return {
        mergedData,
        recentlyUpdatedPositions,
        blackList,
    };
};

export default useMergeWithPendingTxs;
