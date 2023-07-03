import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { getTxType } from './functions/exports';
import { getFormattedNumber } from '../../../../functions/getFormattedNumber';

interface propsIF {
    tx: TransactionIF;
    handleClick: (tx: TransactionIF) => void;
}

export default function TxLI(props: propsIF) {
    const { tx, handleClick } = props;

    // type of transaction in human-readable format
    const txType = getTxType(tx.entityType);

    // value of transaction in human-readable format
    const txValue = getFormattedNumber({ value: tx.totalValueUSD });

    // TODO:   @Junior  please refactor the top-level element of this JSX return
    // TODO:   @Junior  ... to return an <li> element, and refactor parent to
    // TODO:   @Junior  ... render them inside an <ol> element

    return (
        <div className={styles.card_container} onClick={() => handleClick(tx)}>
            <p>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </p>
            <p style={{ textAlign: 'center' }}>{txType}</p>
            <p
                style={{ textAlign: 'center' }}
                className={styles.status_display}
            >
                {txValue}
            </p>
        </div>
    );
}
