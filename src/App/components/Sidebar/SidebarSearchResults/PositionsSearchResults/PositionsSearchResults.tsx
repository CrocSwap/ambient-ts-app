import styles from '../SidebarSearchResults.module.css';

interface PositionsSearchResultPropsIF {
    searchInput: React.ReactNode;
}

export default function PositionsSearchResults(props: PositionsSearchResultPropsIF) {
    const { searchInput } = props;
    false && searchInput;

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

    return (
        <div>
            <div className={styles.card_title}>My Range Positions</div>
            {header}

            <div className={styles.main_result_container}>
                {new Array(0).fill(null).map((item, idx) => (
                    <PositionSearchResult key={idx} />
                ))}
            </div>
        </div>
    );
}
