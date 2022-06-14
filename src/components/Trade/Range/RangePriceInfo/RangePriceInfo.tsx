// START: Import Local Files
import styles from './RangePriceInfo.module.css';
import makeCurrentPrice from './makeCurrentPrice';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
interface IRangePriceInfoPropsIF {
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    apyPercentage: number;
    isTokenABase: boolean;
    didUserFlipDenom: boolean;
}

// central react functional component
export default function RangePriceInfo(props: IRangePriceInfoPropsIF) {
    const {
        spotPriceDisplay,
        maxPriceDisplay,
        minPriceDisplay,
        apyPercentage,
        // isTokenABase,
        didUserFlipDenom
    } = props;

    // JSX frag for estimated APY of position
    const apy = <span className={styles.apy}> Est. APY | {apyPercentage}%</span>;

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display}>
            <span className={styles.price_title}>Min Price</span>
            <span className={styles.min_price}>{minPriceDisplay}</span>
        </div>
    );

    const currentPrice = makeCurrentPrice(
        parseFloat(spotPriceDisplay),
        didUserFlipDenom
    );

    // JSX frag for current pool price for the token pair
    const currentPriceFrag = (
        <div className={styles.price_display}>
            <span className={styles.price_title}>Current Price</span>
            <span className={styles.current_price}>{currentPrice}</span>
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
                {currentPriceFrag}
                {maximumPrice}
            </div>
        </div>
    );
}
