import styles from './TransactionTypeSide.module.css';
export default function TransactionTypeSide() {
    const removeType = <p className={styles.remove_style}>Remove</p>;
    const buyType = <p className={styles.buy_style}>Buy</p>;
    const addType = <p className={styles.add_style}>Add</p>;
    const sellType = <p className={styles.sell_style}>Sell</p>;

    const rangeRemove = <p className={styles.range_style}>Range</p>;
    const rangeAdd = <p className={styles.range_style2}>Range</p>;
    const limitSide = <p className={styles.limit_style}>Limit</p>;
    const marketSide = <p className={styles.market_style}>Market</p>;

    const typeData = {
        remove: removeType,
        buy: buyType,
        add: addType,
        sell: sellType,
    };

    const sideData = {
        rangeRemove: rangeRemove,
        rangeAdd: rangeAdd,
        limit: limitSide,
        market: marketSide,
    };
    return (
        <>
            <section className={styles.type_column}>
                {typeData.remove}
                {sideData.rangeAdd}
            </section>
            <section className={styles.type_sing}>{typeData.remove}</section>
            <section className={styles.side_sing}>{sideData.rangeAdd}</section>
        </>
    );
}
