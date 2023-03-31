import { TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactionsCard.module.css';
import { getTxType, getTxValue } from './functions/exports';

interface propsIF {
    tx: TransactionIF;
    handleClick: (tx: TransactionIF) => void;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const { tx, handleClick } = props;

    // human-readable form of transaction type to display in DOM
    const txType = getTxType(tx.entityType);

    // human-readable form of transaction value to display in DOM
    const txValue = getTxValue(tx);

    const ariaLabel = `Transactions for ${tx.baseSymbol} and ${
        tx.quoteSymbol
    }. ${txType && ` transaction type is ${txType}`}. ${
        txValue && `transaction value is ${txValue}.`
    }`;

    return (
        <button
            className={styles.container}
            onClick={() => handleClick(tx)}
            tabIndex={0}
            aria-label={ariaLabel}
            role='button'
        >
            <div>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </button>
    );
}
3;
