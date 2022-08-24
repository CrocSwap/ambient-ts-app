import styles from '../SidebarSearchResults.module.css';

export default function PositionsSearchResults() {
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

    const exampleContent = new Array(5)
        .fill(null)
        .map((item, idx) => <PositionSearchResult key={idx} />);
    return (
        <div>
            <div className={styles.card_title}>Range Positions</div>
            {header}
            {exampleContent}
        </div>
    );
}
