import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';

interface TransactionsSearchResultPropsIF {
    loading: boolean;
}
export default function TransactionsSearchResults(props: TransactionsSearchResultPropsIF) {
    function TransactionSearchResult() {
        return (
            <div className={styles.card_container}>
                <div>Pool</div>
                <div>Price</div>
                <div>Qty</div>
            </div>
        );
    }

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    const exampleContent = (
        <div className={styles.main_result_container}>
            {new Array(5).fill(null).map((item, idx) => (
                <TransactionSearchResult key={idx} />
            ))}
        </div>
    );
    return (
        <div>
            <div className={styles.card_title}>Recent Transactions</div>
            {header}
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
