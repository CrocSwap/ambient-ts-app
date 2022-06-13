// START: Import Local Files
import styles from './RangePriceInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
interface IRangePriceInfoPropsIF {
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    apyPercentage: number;
}

// central react functional component
export default function RangePriceInfo(props: IRangePriceInfoPropsIF) {
    const { spotPriceDisplay, maxPriceDisplay, minPriceDisplay, apyPercentage } = props;

    // JSX frag for estimated APY of position
    const apy = <span className={styles.apy}> Est. APY | {apyPercentage}%</span>;

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display}>
            <span className={styles.price_title}>Min Price</span>
            <span className={styles.min_price}>{minPriceDisplay}</span>
        </div>
    );

    // JSX frag for current pool price for the token pair
    const currentPrice = (
        <div className={styles.price_display}>
            <span className={styles.price_title}>Current Price</span>
            <span className={styles.current_price}>{spotPriceDisplay}</span>
        </div>
    );

    // JSX frag for highest price in range
    const maximumPrice = (
        <div className={styles.price_display}>
            <span className={styles.price_title}>Max Price</span>
            <span className={styles.max_price}>{maxPriceDisplay}</span>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apy}
            <div className={styles.price_info_content}>
                {minimumPrice}
                {currentPrice}
                {maximumPrice}
            </div>
        </div>
    );
}
