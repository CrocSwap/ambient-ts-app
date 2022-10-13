import styles from '../Transactions.module.css';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface TransactionRowPropsIF {
    tx: ITransaction;

    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;

    openGlobalModal: (content: React.ReactNode) => void;
}
export default function TransactionRow(props: TransactionRowPropsIF) {
    const {
        showColumns,
        ipadView,
        tx,
        showSidebar,
        openGlobalModal,
        // closeGlobalModal,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
    } = props;
    return <div>row</div>;
}
