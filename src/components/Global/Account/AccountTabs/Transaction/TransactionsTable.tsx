import styles from './TransactionsTable.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';

interface TransactionTablePropsIF {
    transactions: ITransaction[];
}

export default function TransactionsTable(props: TransactionTablePropsIF) {
    const { transactions } = props;
    // console.log({ transactions });
    // const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = transactions.map((tx, idx) => <TransactionCard tx={tx} key={idx} />);
    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
