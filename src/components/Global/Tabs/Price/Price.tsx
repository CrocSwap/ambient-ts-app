import styles from './Price.module.css';

interface PriceProps {
    priceType: 'priceBuy' | 'priceSell' | 'minMaxBuy' | 'minMaxAdd';
    displayPrice?: string;
}
export default function Price(props: PriceProps) {
    const { priceType, displayPrice } = props;
    const priceBuy = <p className={styles.buy_style}>{displayPrice ?? 'unknown'}</p>;
    const priceSell = <p className={styles.sell_style}>Price</p>;

    const minMaxBuy = (
        <div className={styles.min_max}>
            <p className={styles.buy_style}>Min</p>
            <p className={styles.buy_style}>Max</p>
        </div>
    );
    const minMaxAdd = (
        <div className={styles.min_max}>
            <p className={styles.add_style}>Min</p>
            <p className={styles.add_style}>Max</p>
        </div>
    );

    const priceData = {
        priceBuy: priceBuy,
        priceSell: priceSell,
        minMaxBuy: minMaxBuy,
        minMaxAdd: minMaxAdd,
    };

    return (
        <>
            <section className={styles.price}>{priceData[priceType]}</section>
        </>
    );
}
