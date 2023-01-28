import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface OrdersSearchResultPropsIF {
    searchedLimitOrders: LimitOrderIF[];
    loading: boolean;
    searchInput: React.ReactNode;
}
export default function OrdersSearchResults(props: OrdersSearchResultPropsIF) {
    const { searchedLimitOrders } = props;
    console.log(searchedLimitOrders);

    function OrderSearchResult() {
        return (
            <div className={styles.card_container}>
                <div>Pool</div>
                <div>Price</div>
                <div>Change</div>
            </div>
        );
    }

    const exampleContent = (
        <div className={styles.main_result_container}>
            {new Array(0).fill(null).map((item, idx) => (
                <OrderSearchResult key={idx} />
            ))}
        </div>
    );
    return (
        <div>
            <div className={styles.card_title}>Limit Orders</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Qty</div>
            </div>
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
