import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';

export default function Exchange() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <ExchangeCard key={idx} />);
    return (
        <div className={styles.container}>
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
