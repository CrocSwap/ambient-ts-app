/* eslint-disable no-irregular-whitespace */

import { useContext, useMemo } from 'react';
import { TransactionIF } from '../../../ambient-utils/types';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { PositionIF } from '../../../ambient-utils/types/position';
import { GraphDataContext, TradeDataContext } from '../../../contexts';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: LimitOrderIF[] | PositionIF[] | TransactionIF[];
}

const useMergeWithPendingTxs = (props: propsIF) => {
    const { data, type } = props;

    const { recentlyUpdatedPositions } = useContext(GraphDataContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const mergedData = useMemo(() => {
        const recentlyUpdatedHashes = new Set();
        const recentlyUpdatedToShow: LimitOrderIF[] | PositionIF[] = [];

        if (recentlyUpdatedPositions) {
            recentlyUpdatedPositions
                .filter(
                    (e) =>
                        e.position &&
                        `${e.position.base}-${e.position.quote}`.toLocaleLowerCase() ===
                            `${baseToken.address}-${quoteToken.address}`.toLocaleLowerCase(),
                )
                .forEach((e) => {
                    if (type === 'Order' && e.type === 'Limit') {
                        if (
                            e.action !== 'Remove' &&
                            e.position &&
                            e.position.positionLiq > 0
                        ) {
                            (recentlyUpdatedToShow as LimitOrderIF[]).push(
                                e.position as LimitOrderIF,
                            );
                        }
                    } else if (props.type === 'Range' && e.type === 'Range') {
                        if (e.position && e.position.positionLiq > 0) {
                            (recentlyUpdatedToShow as PositionIF[]).push(
                                e.position as PositionIF,
                            );
                        }
                    }
                    recentlyUpdatedHashes.add(e.positionHash);
                });
        }

        let clearedData: LimitOrderIF[] | PositionIF[] = [];
        if (type === 'Order') {
            // (recentlyUpdatedToShow as LimitOrderIF[]).forEach((contextData) => {
            //     (data as LimitOrderIF[]).forEach((apiData) => {
            //         if (contextData.positionHash === apiData.positionHash) {
            //             console.log('>>> contextData', contextData.positionLiq);
            //             console.log('>>> apiData', apiData.positionLiq);
            //         }
            //     });

            //     const matchingLimitOrder = (data as LimitOrderIF[]).find(
            //         (apiData) =>
            //             contextData.positionHash === apiData.positionHash &&
            //             contextData.positionLiq === apiData.positionLiq,
            //     );

            //     if (matchingLimitOrder) {
            //         removeFromRecentlyUpdatedPositions(
            //             matchingLimitOrder.positionHash,
            //         );
            //         recentlyUpdatedToShow = (
            //             recentlyUpdatedToShow as LimitOrderIF[]
            //         ).filter(
            //             (e) =>
            //                 e.positionHash !== matchingLimitOrder.positionHash,
            //         );
            //         recentlyUpdatedHashes.delete(
            //             matchingLimitOrder.positionHash,
            //         );
            //     }
            // });

            clearedData = (data as LimitOrderIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionHash),
            );

            console.log('>>> recentlyUpdatedToShow', recentlyUpdatedToShow);
            return [
                ...recentlyUpdatedToShow.reverse(),
                ...clearedData,
            ] as LimitOrderIF[];
        } else if (type === 'Range') {
            // (recentlyUpdatedToShow as PositionIF[]).forEach((contextData) => {
            //     (data as PositionIF[]).forEach((apiData) => {
            //         if (contextData.positionId === apiData.positionId) {
            //             console.log('>>> contextData', contextData.positionLiq);
            //             console.log('>>> apiData', apiData.positionLiq);
            //         }
            //     });

            //     const matchingPosition = (data as PositionIF[]).find(
            //         (apiData) =>
            //             contextData.positionId === apiData.positionId &&
            //             contextData.positionLiq === apiData.positionLiq,
            //     );

            //     if (matchingPosition) {
            //         removeFromRecentlyUpdatedPositions(
            //             matchingPosition.positionId,
            //         );
            //         recentlyUpdatedToShow = (
            //             recentlyUpdatedToShow as PositionIF[]
            //         ).filter(
            //             (e) => e.positionId !== matchingPosition.positionId,
            //         );
            //         recentlyUpdatedHashes.delete(matchingPosition.positionId);
            //     }
            // });

            clearedData = (data as PositionIF[]).filter(
                (e) => !recentlyUpdatedHashes.has(e.positionId),
            );

            console.log('>>> recentlyUpdatedToShow', recentlyUpdatedToShow);
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
    }, [type, data, recentlyUpdatedPositions, baseToken, quoteToken]);

    return {
        mergedData,
        recentlyUpdatedPositions: recentlyUpdatedPositions || [],
    };
};

export default useMergeWithPendingTxs;
