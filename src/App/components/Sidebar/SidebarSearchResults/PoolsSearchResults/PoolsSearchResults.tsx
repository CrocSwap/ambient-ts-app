import styles from '../SidebarSearchResults.module.css';

export default function PoolsSearchResults() {
    function PoolSearchResult() {
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
            <div>Change</div>
        </div>
    );

    const exampleContent = new Array(5)
        .fill(null)
        .map((item, idx) => <PoolSearchResult key={idx} />);
    return (
        <div>
            {header}
            {exampleContent}
        </div>
    );
}
