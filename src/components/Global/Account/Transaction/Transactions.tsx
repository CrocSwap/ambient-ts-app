import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';

export default function Transactions() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <TransactionCard key={idx} />);
    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            {ItemContent}
        </div>
    );
}
