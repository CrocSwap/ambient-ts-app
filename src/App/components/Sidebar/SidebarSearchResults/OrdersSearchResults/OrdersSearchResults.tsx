import LimitOrderLI from './LimitOrderLI';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface OrdersSearchResultPropsIF {
    searchedLimitOrders: LimitOrderIF[];
    isDenomBase: boolean;
}

export default function OrdersSearchResults(props: OrdersSearchResultPropsIF) {
    const { searchedLimitOrders, isDenomBase } = props;

    return (
        <div>
            <div className={styles.card_title}>My Limit Orders</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Value</div>
            </div>
            {
                searchedLimitOrders.slice(0,4).map((limitOrder: LimitOrderIF) => (
                    <LimitOrderLI
                        key={`order-search-result-${JSON.stringify(limitOrder)}`}
                        limitOrder={limitOrder}
                        isDenomBase={isDenomBase}
                    />
                ))
            }
        </div>
    );
}
