import styles from './Transactions2.module.css';
import TransactionCard2 from './TransactionCard2';
import TransactionCard2Header from './TransactionCard2Header';

export default function Transactions2() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <TransactionCard2 key={idx} />);

    return (
        <div className={styles.container}>
            <TransactionCard2Header />
            {ItemContent}
        </div>
    );
}
