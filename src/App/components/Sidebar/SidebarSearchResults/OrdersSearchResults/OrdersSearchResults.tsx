import LimitOrderLI from './LimitOrderLI';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface OrdersSearchResultPropsIF {
    searchedLimitOrders: LimitOrderIF[];
}

export default function OrdersSearchResults(props: OrdersSearchResultPropsIF) {
    const { searchedLimitOrders } = props;

    return (
        <div>
            <div className={styles.card_title}>Limit Orders</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Qty</div>
            </div>
            {
                searchedLimitOrders.map((limitOrder: LimitOrderIF) => (
                    <LimitOrderLI
                        key={`order-search-result-${JSON.stringify(limitOrder)}`}
                        limitOrder={limitOrder}
                    />
                ))
            }
        </div>
    );
}
