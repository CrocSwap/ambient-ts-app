import styles from './Orders.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';
// import { Dispatch, SetStateAction } from 'react';
interface OrdersProps {
    expandTradeTable: boolean;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Orders(props: OrdersProps) {
    const { expandTradeTable } = props;
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
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {ItemContent}
            </div>
        </div>
    );
}
