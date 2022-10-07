import styles from './OrderTypeSide.module.css';

interface OrderTypeSideProps {
    type: 'limit' | 'order' | 'market';
    side: 'buy' | 'sell';
    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;
    isDenomBase?: boolean;
}
export default function OrderTypeSide(props: OrderTypeSideProps) {
    const { type, side, isDenomBase, baseTokenCharacter, quoteTokenCharacter } = props;

    const limitType = <p className={styles.limit_style}>Limit</p>;
    const orderType = <p className={styles.order_style}>Order</p>;
    const marketType = <p className={styles.market_style}>Order</p>;

    const buySide = (
        <p className={styles.buy_style}>
            Buy {isDenomBase ? baseTokenCharacter : quoteTokenCharacter}
        </p>
    );
    const sellSide = (
        <p className={styles.sell_style}>
            Sell {isDenomBase ? baseTokenCharacter : quoteTokenCharacter}
        </p>
    );

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
                {sideData[side]}
                {typeData[type]}
            </section>
            <section className={styles.side_sing}>{sideData[side]}</section>
            <section className={styles.type_sing}>{typeData[type]}</section>
        </>
    );
}
