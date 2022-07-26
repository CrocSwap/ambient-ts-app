import styles from './TransactionTypeSide.module.css';

interface TransactionTypeSideProps {
    type: 'remove' | 'buy' | 'add' | 'sell';
    side: 'rangeRemove' | 'rangeAdd' | 'limit' | 'market';
}
export default function TransactionTypeSide(props: TransactionTypeSideProps) {
    const { type, side } = props;
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
                {typeData[type]}
                {sideData[side]}
            </section>
            <section className={styles.type_sing}>{typeData[type]}</section>
            <section className={styles.side_sing}>{sideData[side]}</section>
        </>
    );
}
