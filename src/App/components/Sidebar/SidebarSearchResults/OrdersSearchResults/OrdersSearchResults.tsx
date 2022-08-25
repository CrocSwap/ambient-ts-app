import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';

interface OrdersSearchResultPropsIF {
    loading: boolean;
}
export default function OrdersSearchResults(props: OrdersSearchResultPropsIF) {
    function OrderSearchResult() {
        return (
            <div className={styles.card_container}>
                <div>Pool</div>
                <div>Price</div>
                <div>Change</div>
            </div>
        );
    }

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Qty</div>
        </div>
    );

    const exampleContent = (
        <div className={styles.main_result_container}>
            {new Array(5).fill(null).map((item, idx) => (
                <OrderSearchResult key={idx} />
            ))}
        </div>
    );
    return (
        <div>
            <div className={styles.card_title}>Limit Orders</div>
            {header}
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
