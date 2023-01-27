import { Dispatch, SetStateAction } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { getTxType, getTxValue } from './functions/exports';
import { useClick } from './hooks/useClick';

interface propsIF {
    tx: TransactionIF;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function TxLI(props: propsIF) {
    const {
        tx,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled
    } = props;

    const handleClick = useClick(
        tx,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentTxActiveInTransactions,
        setIsShowAllEnabled
    );

    // type of transaction in human-readable format
    const txType = getTxType(tx.entityType);

    // value of transaction in human-readable format
    const txValue = getTxValue(
        tx.valueUSD,
        tx.totalValueUSD,
        tx.totalFlowUSD
    );

    return (
        <div className={styles.card_container} onClick={() => handleClick()}>
            <div>{tx.baseSymbol} / {tx.quoteSymbol}</div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </div>
    );
}