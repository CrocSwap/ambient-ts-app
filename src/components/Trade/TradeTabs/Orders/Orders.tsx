import styles from './Orders.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';

export default function Orders() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <OrderCard key={idx} />
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            <OrderCardHeader />
            {ItemContent}
        </div>
    );
}
