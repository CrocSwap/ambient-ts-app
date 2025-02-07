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

    const { recentlyUpdatedPositions, prevPositionHashes } =
        useContext(GraphDataContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    // console.log('>>> prevPositionHashes', prevPositionHashes);

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
                        if (e.action !== 'Remove') {
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
                            (recentlyUpdatedToShow as PositionIF[]).push(
                                e.position as PositionIF,
                            );
                        }
                        recentlyUpdatedHashes.add(e.positionHash);

                        // if (e.prevPositionHash) {
                        //     recentlyUpdatedHashes.add(
                        //         e.prevPositionHash,
                        //     );
                        // }
                    }
                });
        }

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
    }, [type, data, recentlyUpdatedPositions, baseToken, quoteToken]);

    return {
        mergedData,
        recentlyUpdatedPositions: recentlyUpdatedPositions || [],
    };
};

export default useMergeWithPendingTxs;
