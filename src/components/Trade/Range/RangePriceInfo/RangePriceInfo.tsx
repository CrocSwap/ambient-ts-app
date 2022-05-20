// import { ChangeEvent } from 'react';
import styles from './RangePriceInfo.module.css';

interface IRangeProps {
    spotPriceDisplay: string;
}

export default function RangePriceInfo(props: IRangeProps) {
    const priceInfo = (
        <div className={styles.price_info_container}>
            <span className={styles.apy}> Est.APY | 35.65%</span>
            <div className={styles.price_info_content}>
                <div className={styles.price_display}>
                    <span className={styles.price_title}>Min Price</span>
                    <span className={styles.min_price}>$2,100.00</span>
                </div>
                <div className={styles.price_display}>
                    <span className={styles.price_title}>Current Price</span>
                    <span className={styles.current_price}>${props.spotPriceDisplay}</span>
                </div>
                <div className={styles.price_display}>
                    <span className={styles.price_title}>Max Price</span>
                    <span className={styles.max_price}>$4000.00</span>
                </div>
            </div>
            <div className={styles.collateral_container}>
                <div className={styles.collateral_display}>
                    <span className={styles.collateral_title}>ETH Collateral</span>
                    <span className={styles.collateral_amount}>1.69</span>
                </div>
                <div className={styles.collateral_display}>
                    <span className={styles.collateral_title}>USDC Collateral</span>
                    <span className={styles.collateral_amount}>5,000.00</span>
                </div>
            </div>
        </div>
    );

    return <>{priceInfo}</>;
}
