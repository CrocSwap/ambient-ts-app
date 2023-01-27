import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { getTxType, getTxValue } from './functions/exports';

interface propsIF {
    tx: TransactionIF;
}

export default function TxLI(props: propsIF) {
    const { tx } = props;

    // type of transaction in human-readable format
    const txType = getTxType(tx.entityType);

    // value of transaction in human-readable format
    const txValue = getTxValue(
        tx.valueUSD,
        tx.totalValueUSD,
        tx.totalFlowUSD
    );

    return (
        <div className={styles.card_container}>
            <div>{tx.baseSymbol} / {tx.quoteSymbol}</div>
            <div>{txType}</div>
            <div className={styles.status_display}>{txValue}</div>
        </div>
    );
}