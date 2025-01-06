/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useEffect, useMemo, useState } from 'react';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    GraphDataContext,
    TokenContext,
    TradeDataContext,
    UserDataContext,
} from '../../../contexts';
import { fetchPoolLimitOrders } from '../../../ambient-utils/api/fetchPoolLimitOrders';
import { fetchPoolPositions } from '../../../ambient-utils/api/fetchPoolPositions';
import { PositionIF } from '../../../ambient-utils/types/position';
import {
    ReceiptContext,
    TransactionByType,
} from '../../../contexts/ReceiptContext';
import useGenFakeTableRow from './useGenFakeTableRow';
import { TransactionIF } from '../../../ambient-utils/types';

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

    const [relevantTransactions, setRelevantTransactions] = useState<
        TransactionByType[]
    >([]);

    const [recentlyUpdatedPositions, setRecentlyUpdatedPositions] = useState<
        RecentlyUpdatedPositionIF[]
    >([]);

    const { genFakeLimitOrder, genFakePosition } = useGenFakeTableRow();

    const {
        activeNetwork: { poolIndex },
    } = useContext(AppStateContext);

    useEffect(() => {
        if (props.type === 'Order') {
            const relTxs = transactionsByType.filter(
                (tx) =>
                    !tx.isRemoved &&
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

            setRelevantTransactions(relTxs);
        } else if (props.type === 'Range') {
            const relTxs = transactionsByType.filter(
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
            setRelevantTransactions(relTxs);
        }
    }, [transactionsByType]);

    useEffect(() => {
        if (relevantTransactions.length === 0) {
            setRecentlyUpdatedPositions([]);
            return;
        }

        (async () => {
            if (props.type === 'Order') {
                Promise.all(
                    relevantTransactions.map((tx) => {
                        return genFakeLimitOrder(tx);
                    }),
                ).then((rows) => {
                    updateRelevantTransactions(rows);
                });
            } else if (props.type === 'Range') {
                Promise.all(
                    relevantTransactions.map((tx) => {
                        return genFakePosition(tx);
                    }),
                ).then((rows) => {
                    updateRelevantTransactions(rows);
                });
            }
        })();
    }, [relevantTransactions]);

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
                60;
            if (isFresh) {
                if (props.type === 'Order') {
                    if (e.action !== 'Remove') {
                        (recentlyUpdatedToShow as LimitOrderIF[]).push(
                            e.position as LimitOrderIF,
                        );
                    }
                } else if (
                    props.type === 'Range' &&
                    e.position.positionLiq !== 0
                ) {
                    (recentlyUpdatedToShow as PositionIF[]).push(
                        e.position as PositionIF,
                    );
                }
                recentlyUpdatedHashes.add(e.positionHash);
            }
        });

        let clearedData: LimitOrderIF[] | PositionIF[] = [];
        if (props.type === 'Order') {
            clearedData = (data as LimitOrderIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionHash),
            );
            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as LimitOrderIF[];
        } else if (props.type === 'Range') {
            clearedData = (data as PositionIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionId),
            );
            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as PositionIF[];
        }

        return [];
    }, [data, recentlyUpdatedPositions]);

    return {
        mergedData,
        recentlyUpdatedPositions,
    };
};

export default useMergeWithPendingTxs;
