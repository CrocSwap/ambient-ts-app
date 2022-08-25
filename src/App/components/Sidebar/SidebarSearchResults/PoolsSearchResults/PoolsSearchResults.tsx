import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';

interface PoolsSearchResultPropsIF {
    loading: boolean;
}

export default function PoolsSearchResults(props: PoolsSearchResultPropsIF) {
    function PoolSearchResult() {
        return (
            <div className={styles.card_container}>
                <div>Pool</div>
                <div>Price</div>
                <div>Gain</div>
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
                <PoolSearchResult key={idx} />
            ))}
        </div>
    );

    return (
        <div>
            <div className={styles.card_title}>Pools</div>
            {header}
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
