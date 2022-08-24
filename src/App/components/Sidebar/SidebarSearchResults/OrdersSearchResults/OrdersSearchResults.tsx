import styles from '../SidebarSearchResults.module.css';

export default function OrdersSearchResults() {
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

    const exampleContent = new Array(5)
        .fill(null)
        .map((item, idx) => <OrderSearchResult key={idx} />);
    return (
        <div>
            <div className={styles.card_title}>Limit Orders</div>
            {header}
            {exampleContent}
        </div>
    );
}
