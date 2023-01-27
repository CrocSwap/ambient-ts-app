import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { getTxType } from './functions/getTxType';
import { getTxValue } from './functions/getTxValue';

interface propsIF {
    tx: TransactionIF;
}

export default function TxLI(props: propsIF) {
    const { tx } = props;

    const txType = getTxType(tx.entityType)

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