/* eslint-disable no-irregular-whitespace */

import { useContext, useMemo } from 'react';
import { bigintReplacer } from '../../../ambient-utils/dataLayer/functions/bigIntReplacer';
import { TransactionIF } from '../../../ambient-utils/types';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { PositionIF } from '../../../ambient-utils/types/position';
import {
    GraphDataContext,
    ReceiptContext,
    TradeDataContext,
} from '../../../contexts';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: LimitOrderIF[] | PositionIF[] | TransactionIF[];
}

const useMergeWithPendingTxs = (props: propsIF) => {
    const { data, type } = props;

    const {
        recentlyUpdatedPositions,
        prevPositionHashes,
        handleIndexedPosition,
        pendingRecentlyUpdatedPositions,
    } = useContext(GraphDataContext);

    const { removePendingTxIfs } = useContext(ReceiptContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const mergedData = useMemo(() => {
        const recentlyUpdatedHashes = new Set(prevPositionHashes);
        const recentlyUpdatedToShow: LimitOrderIF[] | PositionIF[] = [];

        if (recentlyUpdatedPositions) {
            recentlyUpdatedPositions
                .filter(
                    (e) =>
                        e.position &&
                        `${e.position.base}-${e.position.quote}`.toLocaleLowerCase() ===
                            `${baseToken.address}-${quoteToken.address}`.toLocaleLowerCase() &&
                        e.isSuccess,
                )
                .forEach((e) => {
                    if (type === 'Order' && e.type === 'Limit') {
                        if (
                            e.action !== 'Remove' &&
                            e.position &&
                            e.position.positionLiq > 0
                        ) {
                            // remove from pendings if indexed -------------------
                            const matchingOrder = (data as LimitOrderIF[]).find(
                                (order) =>
                                    order.positionHash === e.positionHash,
                            );
                            if (
                                matchingOrder?.liqRefreshTime &&
                                matchingOrder.liqRefreshTime >
                                    e.timestamp / 1000
                            ) {
                                removePendingTxIfs(e.positionHash);
                                handleIndexedPosition(e.positionHash);
                                return;
                            }
                            // ------------------------------------------------------

                            (recentlyUpdatedToShow as LimitOrderIF[]).push(
                                e.position as LimitOrderIF,
                            );
                        }
                        recentlyUpdatedHashes.add(e.positionHash);
                    } else if (props.type === 'Range' && e.type === 'Range') {
                        if (
                            e.position &&
                            e.position.positionLiq > 0 &&
                            !prevPositionHashes.has(e.positionHash)
                        ) {
                            // remove from pendings if indexed -------------------
                            const matchingOrder = (data as PositionIF[]).find(
                                (order) => order.positionId === e.positionHash,
                            );
                            if (
                                matchingOrder?.liqRefreshTime &&
                                matchingOrder.liqRefreshTime >
                                    e.timestamp / 1000
                            ) {
                                removePendingTxIfs(e.positionHash);
                                handleIndexedPosition(e.positionHash);
                                return;
                            }
                            // ------------------------------------------------------

                            (recentlyUpdatedToShow as PositionIF[]).push(
                                e.position as PositionIF,
                            );
                        }
                        recentlyUpdatedHashes.add(e.positionHash);
                    }
                });
        }

        let clearedData: LimitOrderIF[] | PositionIF[] = [];

        if (type === 'Order') {
            clearedData = (data as LimitOrderIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionHash),
            );

            // placeholder list check with infinitescroll data
            pendingRecentlyUpdatedPositions.forEach((e) => {
                const matchingOrder = (data as LimitOrderIF[]).find(
                    (order) => order.positionHash === e.positionHash,
                );
                if (matchingOrder) {
                    if (
                        matchingOrder.liqRefreshTime &&
                        matchingOrder.liqRefreshTime > e.timestamp / 1000
                    ) {
                        removePendingTxIfs(e.positionHash);
                        handleIndexedPosition(e.positionHash);
                        return;
                    }
                }
            });

            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as LimitOrderIF[];
        } else if (type === 'Range') {
            clearedData = (data as PositionIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionId),
            );

            // placeholder list check with infinitescroll data
            pendingRecentlyUpdatedPositions.forEach((e) => {
                const matchingPosition = (data as PositionIF[]).find(
                    (position) => position.positionId === e.positionHash,
                );
                if (matchingPosition) {
                    if (
                        matchingPosition.liqRefreshTime &&
                        matchingPosition.liqRefreshTime > e.timestamp / 1000
                    ) {
                        removePendingTxIfs(e.positionHash);
                        handleIndexedPosition(e.positionHash);
                        return;
                    }
                }
            });

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
    }, [
        type,
        JSON.stringify(data),
        JSON.stringify(recentlyUpdatedPositions, bigintReplacer),
        baseToken.address,
        quoteToken.address,
    ]);

    return {
        mergedData,
        recentlyUpdatedPositions: recentlyUpdatedPositions || [],
    };
};

export default useMergeWithPendingTxs;
