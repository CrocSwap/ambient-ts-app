import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    tx: TransactionIF;
}

export default function TxLI(props: propsIF) {
    const { tx } = props;

    return (
        <div className={styles.card_container}>
            <div>{tx.baseSymbol} / {tx.quoteSymbol}</div>
            <div>Price</div>
            <div>Qty</div>
        </div>
    );
}