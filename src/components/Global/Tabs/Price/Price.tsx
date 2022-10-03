import styles from './Price.module.css';

interface PriceProps {
    priceType: 'priceBuy' | 'priceSell' | 'minMaxBuy' | 'minMaxAdd' | 'range';
    displayPrice?: string;
    truncatedLowDisplayPrice?: string;
    truncatedHighDisplayPrice?: string;
    isAmbient?: boolean;
}
export default function Price(props: PriceProps) {
    const {
        priceType,
        displayPrice,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        isAmbient,
    } = props;
    const priceBuy = <p className={styles.buy_style}>{displayPrice ?? '…'}</p>;
    const priceSell = <p className={styles.sell_style}>{displayPrice ?? '…'}</p>;
    const range = isAmbient ? (
        <p className={styles.sell_style}>Ambient</p>
    ) : (
        // <p className={styles.sell_style}>Ambient (0-∞)</p>
        <p className={styles.sell_style}>
            {truncatedLowDisplayPrice + '-' + truncatedHighDisplayPrice ?? '…'}
        </p>
    );

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
        range: range,
    };

    return (
        <>
            <section className={styles.price}>{priceData[priceType]}</section>
        </>
    );
}
