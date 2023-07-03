import { TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactionsCard.module.css';
import { getTxType } from './functions/exports';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    tx: TransactionIF;
    handleClick: (tx: TransactionIF) => void;
}

export default function SidebarRecentTransactionsCard(props: propsIF) {
    const { tx, handleClick } = props;

    // human-readable form of transaction type to display in DOM
    const txType = getTxType(tx.entityType);

    // human-readable form of transaction value to display in DOM
    const txValue = getFormattedNumber({
        value: tx.totalValueUSD,
        prefix: '$',
    });

    return (
        <div className={styles.container} onClick={() => handleClick(tx)}>
            <div>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </div>
    );
}
3;
