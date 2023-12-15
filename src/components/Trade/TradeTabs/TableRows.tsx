import { memo, useContext, useEffect, useState } from 'react';
import {
    LimitModalAction,
    LimitOrderIF,
    PositionIF,
    RangeModalAction,
    TransactionIF,
} from '../../../ambient-utils/types';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { useModal } from '../../Global/Modal/useModal';
import RangesRow from './Ranges/RangesTable/RangesRow';
import RangeDetailsModal from '../../RangeDetails/RangeDetailsModal/RangeDetailsModal';
import RangeActionModal from '../../RangeActionModal/RangeActionModal';
import LimitActionModal from '../../LimitActionModal/LimitActionModal';
import TransactionRow from './Transactions/TransactionsTable/TransactionRow';
import TransactionDetailsModal from '../../Global/TransactionDetails/TransactionDetailsModal';
import { getMoneynessRank } from '../../../ambient-utils/dataLayer';
import OrderRow from './Orders/OrderTable/OrderRow';
import OrderDetailsModal from '../../OrderDetails/OrderDetailsModal/OrderDetailsModal';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    isLeaderboard?: boolean;
    positionsByApy?: string[];
}

type ActiveRecord = TransactionIF | LimitOrderIF | PositionIF | undefined;

function TableRows({
    type,
    data,
    isAccountView,
    tableView,
    isLeaderboard,
    positionsByApy,
}: propsIF) {
    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    const [isActionModalOpen, openActionModal, closeActionModal] = useModal();

    const {
        currentPositionActive,
        setCurrentPositionActive,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        currentLimitOrderActive,
        setCurrentLimitOrderActive,
    } = useContext(TradeTableContext);

    // Range Modal Controls
    const [rangeModalAction, setRangeModalAction] =
        useState<RangeModalAction>('Harvest');

    const closeRangeModal = (modalType: 'action' | 'details') => {
        setCurrentPositionActive('');
        modalType === 'action' ? closeActionModal() : closeDetailsModal();
    };

    const openRangeModal = (
        recordId: string,
        modalType: 'action' | 'details',
    ) => {
        setCurrentPositionActive(recordId);
        modalType === 'action' ? openActionModal() : openDetailsModal();
    };

    const [rankingMap] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        console.log('positions by pay');
        positionsByApy?.forEach((posId, idx) => {
            rankingMap.set(posId, idx + 1);
        });
    }, [positionsByApy]);
    // ----------------------

    // Transaction Modal Controls
    const closeTransactionModal = () => {
        setCurrentTxActiveInTransactions('');
        closeDetailsModal();
    };

    const openTransactionModal = (recordId: string) => {
        setCurrentTxActiveInTransactions(recordId);
        openDetailsModal();
    };

    const getBaseTokenMoneynessGreaterOrEqual = (
        record: TransactionIF | LimitOrderIF,
    ) =>
        getMoneynessRank(record.baseSymbol) -
            getMoneynessRank(record.quoteSymbol) >=
        0;
    // ----------------------

    // Limit Modal Controls
    const [limitModalAction, setLimitModalAction] =
        useState<LimitModalAction>('Remove');

    const closeLimitModal = (modalType: 'action' | 'details') => {
        setCurrentLimitOrderActive('');
        modalType === 'action' ? closeActionModal() : closeDetailsModal();
    };

    const openLimitModal = (
        recordId: string,
        modalType: 'action' | 'details',
    ) => {
        setCurrentLimitOrderActive(recordId);
        modalType === 'action' ? openActionModal() : openDetailsModal();
    };

    // ----------------------

    // Determine active/selected record
    const [activeRecord, setActiveRecord] = useState<ActiveRecord>(undefined);

    useEffect(() => {
        console.log('TableRows useEffect');
        if (type === 'Range') {
            setActiveRecord(
                (data as PositionIF[]).find((position) => {
                    return position.positionId === currentPositionActive;
                }),
            );
        } else if (type === 'Order') {
            setActiveRecord(
                (data as LimitOrderIF[]).find((order) => {
                    return order.limitOrderId === currentLimitOrderActive;
                }),
            );
        } else {
            setActiveRecord(
                (data as TransactionIF[]).find((tx) => {
                    return tx.txId === currentTxActiveInTransactions;
                }),
            );
        }
    }, [type, data]);

    useEffect(() => {
        console.log({ type });
        console.log({ data });
    }, [data.length]);

    const rangeContent = () => {
        return (
            <>
                {(data as PositionIF[]).map((position, idx) => (
                    <RangesRow
                        key={idx}
                        position={position}
                        tableView={tableView}
                        isAccountView={isAccountView}
                        isLeaderboard={isLeaderboard}
                        rank={rankingMap.get(position.positionId)}
                        openDetailsModal={() =>
                            openRangeModal(position.positionId, 'details')
                        }
                        openActionModal={() =>
                            openRangeModal(position.positionId, 'action')
                        }
                        setRangeModalAction={setRangeModalAction}
                    />
                ))}
                {isDetailsModalOpen && activeRecord && (
                    <RangeDetailsModal
                        position={activeRecord as PositionIF}
                        isAccountView={isAccountView}
                        onClose={() => closeRangeModal('details')}
                    />
                )}
                {isActionModalOpen && activeRecord && (
                    <RangeActionModal
                        type={rangeModalAction}
                        position={activeRecord as PositionIF}
                        onClose={() => closeRangeModal('action')}
                        isAccountView={isAccountView}
                    />
                )}
            </>
        );
    };

    const transactionContent = () => {
        return (
            <>
                {(data as TransactionIF[]).map((tx, idx) => (
                    <TransactionRow
                        key={idx}
                        idForDOM={`tx_row_${idx}`}
                        tx={tx}
                        tableView={tableView}
                        isAccountView={isAccountView}
                        openDetailsModal={() => openTransactionModal(tx.txId)}
                    />
                ))}
                {isDetailsModalOpen && activeRecord && (
                    <TransactionDetailsModal
                        tx={activeRecord as TransactionIF}
                        isBaseTokenMoneynessGreaterOrEqual={getBaseTokenMoneynessGreaterOrEqual(
                            activeRecord as TransactionIF,
                        )}
                        isAccountView={isAccountView}
                        onClose={closeTransactionModal}
                    />
                )}
            </>
        );
    };

    const limitContent = () => {
        return (
            <>
                {(data as LimitOrderIF[]).map((order, idx) => (
                    <OrderRow
                        key={idx}
                        limitOrder={order}
                        tableView={tableView}
                        isAccountView={isAccountView}
                        openDetailsModal={() =>
                            openLimitModal(order.limitOrderId, 'details')
                        }
                        openActionModal={() =>
                            openLimitModal(order.limitOrderId, 'action')
                        }
                        setLimitModalAction={setLimitModalAction}
                    />
                ))}
                {isDetailsModalOpen && activeRecord && (
                    <OrderDetailsModal
                        limitOrder={activeRecord as LimitOrderIF}
                        isBaseTokenMoneynessGreaterOrEqual={getBaseTokenMoneynessGreaterOrEqual(
                            activeRecord as LimitOrderIF,
                        )}
                        isAccountView={isAccountView}
                        onClose={() => closeLimitModal('details')}
                    />
                )}
                {isActionModalOpen && activeRecord && (
                    <LimitActionModal
                        limitOrder={activeRecord as LimitOrderIF}
                        type={limitModalAction}
                        isAccountView={isAccountView}
                        onClose={() => closeLimitModal('action')}
                    />
                )}
            </>
        );
    };

    return (
        <>
            {type === 'Range' && rangeContent()}
            {type === 'Transaction' && transactionContent()}
            {type == 'Order' && limitContent()}
        </>
    );
}

export default memo(TableRows);
