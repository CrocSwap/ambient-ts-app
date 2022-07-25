import styles from './Order2.module.css';
import OrderCard2 from './OrderCard2';
import OrderCard2Header from './OrderCard2Header';

export default function Order2() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <OrderCard2 key={idx} />);

    return (
        <div className={styles.container}>
            <OrderCard2Header />
            {ItemContent}
        </div>
    );
}
