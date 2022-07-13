import LimitOrderCard from '../../Global/LimitOrder/LimitOrderCard';
import styles from './LimitOrders.module.css';

export default function LimitOrders() {
    const exampleLimitOrders = [1, 2, 3];

    const LimitOrdersDisplay = exampleLimitOrders.map((order, idx) => <LimitOrderCard key={idx} />);

    return <div className={styles.limitOrders_table_display}>{LimitOrdersDisplay}</div>;
}
