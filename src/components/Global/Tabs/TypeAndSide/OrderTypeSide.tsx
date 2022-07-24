import styles from './OrderTypeSide.module.css';
export default function OrderTypeSide() {
    const limitType = <p className={styles.limit_style}>Limit</p>;
    const orderType = <p className={styles.order_style}>Order</p>;
    const marketType = <p className={styles.market_style}>Order</p>;

    const buySide = <p className={styles.buy_style}>Buy</p>;
    const sellSide = <p className={styles.sell_style}>Sell</p>;

    const typeData = {
        limit: limitType,
        order: orderType,
        market: marketType,
    };

    const sideData = {
        buy: buySide,
        sell: sellSide,
    };
    return (
        <>
            <section className={styles.type_column}>
                <p>Buy</p>
                <p>Limit</p>
            </section>
            <section className={styles.side_sing}>Buy</section>
            <section className={styles.type_sing}>Limit</section>
        </>
    );
}
