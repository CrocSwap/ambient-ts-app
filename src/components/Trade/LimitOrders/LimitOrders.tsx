import LimitOrder from '../../LimitOrder/LimitOrder';
import styles from './LimitOrders.module.css';

export default function LimitOrders() {
    const exampleLimitOrders = [1, 2, 3];

    const LimitOrdersDisplay = exampleLimitOrders.map((order, idx) => <LimitOrder key={idx} />);

    const LimitOrdersHeader = (
        <thead>
            <tr>
                <th>Id</th>
                <th>Price</th>
                <th>From</th>
                <th>To</th>
                <th></th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.limitOrders_table_display}>
            <table>
                {LimitOrdersHeader}

                <tbody>{LimitOrdersDisplay}</tbody>
            </table>
        </div>
    );
}
