import styles from './AdvancedPriceInfo.module.css';
// import { TokenPairIF } from '../../../../../utils/interfaces/exports';

// interface AdvancedPriceInfoIF {
//     tokenPair: TokenPairIF;
// }

export default function AdvancedPriceInfo() {
    // JSX frag to display the pool price for the current pair
    const currentPrice = (
        <div className={styles.price_info_row}>
            <div>Current Price</div>
            <div className={styles.current_price}>2,800</div>
        </div>
    );

    // JSX frag to display the estimated APY of the position
    const estimatedAPY = (
        <div className={styles.apy_display}>
            <div>Est.APY | 36.68%</div>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {currentPrice}
                {estimatedAPY}
            </div>
        </div>
    );
}
