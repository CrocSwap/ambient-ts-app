import styles from './TransactionsTable.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { TransactionIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    txs: TransactionIF[];
}

export default function TransactionsTable(props: propsIF) {
    const { txs } = props;

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            <div className={styles.item_container}>
                {txs.map((tx, idx) => (
                    <TransactionCard tx={tx} key={idx} />
                ))}
            </div>
        </div>
    );
}
