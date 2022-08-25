import styles from '../SidebarSearchResults.module.css';

import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';

interface PositionsSearchResultPropsIF {
    loading: boolean;
    searchInput: React.ReactNode;
}
export default function PositionsSearchResults(props: PositionsSearchResultPropsIF) {
    function PositionSearchResult() {
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
                <PositionSearchResult key={idx} />
            ))}
        </div>
    );

    return (
        <div>
            <div className={styles.card_title}>Range Positions</div>
            {header}

            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
