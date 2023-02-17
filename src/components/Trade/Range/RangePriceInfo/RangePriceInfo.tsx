// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import { formatDaysRange } from '../../../../App/functions/formatDaysRange';
import { useLocation } from 'react-router-dom';

// interface for component props
interface propsIF {
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    aprPercentage: number | undefined;
    daysInRange: number | undefined;
    didUserFlipDenom: boolean;
    poolPriceCharacter: string;
    minRangeDenomByMoneyness?: string;
    maxRangeDenomByMoneyness?: string;
}

// central react functional component
export default function RangePriceInfo(props: propsIF) {
    const {
        spotPriceDisplay,
        poolPriceCharacter,
        maxPriceDisplay,
        minPriceDisplay,
        aprPercentage,
        daysInRange,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
    } = props;

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';
    // JSX frag for estimated APR of position
    const apr = <span className={styles.apr}>{aprPercentageString}</span>;

    const daysInRangeString = daysInRange
        ? `Est. Time in Range | ${formatDaysRange(daysInRange)}`
        : '…';
    // JSX frag for estimated APR of position
    const days = <span className={styles.apr}>{daysInRangeString}</span>;

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span className={styles.min_price}>
                {isOnTradeRoute ? minPriceDisplay : minRangeDenomByMoneyness}
                {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    // const currentPrice = makeCurrentPrice(parseFloat(spotPriceDisplay), didUserFlipDenom);
    const currentPrice = spotPriceDisplay;

    // JSX frag for highest price in range
    const maximumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Max Price</h4>
            <span className={styles.max_price}>
                {isOnTradeRoute ? maxPriceDisplay : maxRangeDenomByMoneyness}
                {/* {truncateDecimals(parseFloat(maxPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apr}
            {days}
            <div className={styles.price_info_content}>
                {minimumPrice}
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span className={styles.current_price}>
                        {currentPrice === 'Infinity' ? '…' : `${poolPriceCharacter}${currentPrice}`}
                    </span>
                </div>
                {maximumPrice}
            </div>
        </div>
    );
}
