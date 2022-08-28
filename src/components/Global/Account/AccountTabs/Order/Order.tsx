import styles from './Order.module.css';
// import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';

export default function Order() {
    // const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    const ItemContent = (
        <div className={styles.item_container}>
            {/* {items.map((item, idx) => (
                <OrderCard key={idx} />
            ))} */}
        </div>
    );

    return (
        <div className={styles.container}>
            <OrderCardHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
