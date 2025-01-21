/* eslint-disable no-irregular-whitespace */

import { useContext, useMemo, useState } from 'react';
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

    const [blackList, setBlackList] = useState<Set<string>>();

    const mergedData = useMemo(() => {
        const recentlyUpdatedHashes = new Set();
        const recentlyUpdatedToShow: LimitOrderIF[] | PositionIF[] = [];

        if (recentlyUpdatedPositions) {
            recentlyUpdatedPositions
                .filter(
                    (e) =>
                        `${e.position.base}-${e.position.quote}`.toLocaleLowerCase() ===
                        `${baseToken.address}-${quoteToken.address}`.toLocaleLowerCase(),
                )
                .forEach((e) => {
                    if (type === 'Order' && e.type === 'Limit') {
                        if (
                            e.action !== 'Remove' &&
                            e.position.totalValueUSD > 0.01
                        ) {
                            (recentlyUpdatedToShow as LimitOrderIF[]).push(
                                e.position as LimitOrderIF,
                            );
                        } else {
                            setBlackList((prev) => {
                                return new Set([
                                    ...(prev || []),
                                    e.positionHash,
                                ]);
                            });
                        }
                    } else if (props.type === 'Range' && e.type === 'Range') {
                        if (e.position.positionLiq > 0.01) {
                            (recentlyUpdatedToShow as PositionIF[]).push(
                                e.position as PositionIF,
                            );
                        } else {
                            setBlackList((prev) => {
                                return new Set([
                                    ...(prev || []),
                                    e.positionHash,
                                ]);
                            });
                        }
                    }
                    recentlyUpdatedHashes.add(e.positionHash);
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
        blackList,
    };
};

export default useMergeWithPendingTxs;
