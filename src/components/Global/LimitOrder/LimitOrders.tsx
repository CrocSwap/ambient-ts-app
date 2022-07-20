import LimitOrderCard from './LimitOrderCard';
import LimitOrderHeader from './LimitOrderHeader';
import styles from './LimitOrders.module.css';

export default function LimitOrders() {
    const exampleLimitOrders = [1, 2, 3, 4, 5, 6, 7, 8];

    const LimitOrdersDisplay = exampleLimitOrders.map((order, idx) => <LimitOrderCard key={idx} />);

    return (
        <div className={styles.limitOrders_table_display}>
            <LimitOrderHeader />
            {LimitOrdersDisplay}
        </div>
    );
}
