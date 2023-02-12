import styles from './AdvancedPriceInfo.module.css';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';
import truncateDecimals from '../../../../../utils/data/truncateDecimals';
import { formatDaysRange } from '../../../../../App/functions/formatDaysRange';

interface propsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: string;
    isDenomBase: boolean;
    isTokenABase: boolean;
    minimumSpan: number;
    isOutOfRange: boolean;
    aprPercentage: number | undefined;
    daysInRange: number | undefined;
}

export default function AdvancedPriceInfo(props: propsIF) {
    // JSX frag to display the pool price for the current pair
    const {
        tokenPair,
        poolPriceDisplay,
        isDenomBase,
        isTokenABase,
        minimumSpan,
        isOutOfRange,
        aprPercentage,
        daysInRange,
    } = props;

    const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    // const displayPriceString = isDenomBase
    //     ? truncateDecimals(1 / parseFloat(poolPriceDisplay), 4).toString()
    //     : truncateDecimals(parseFloat(poolPriceDisplay), 4).toString();

    const currentPrice = (
        <div className={styles.price_info_row}>
            <div>Current Price: </div>
            <div className={styles.current_price}>
                {reverseDisplay
                    ? `${poolPriceDisplay} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                    : `${poolPriceDisplay} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`}
            </div>
        </div>
    );

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';
    // JSX frag for estimated APR of position
    const apr = <span className={styles.apr}>{aprPercentageString}</span>;

    const daysInRangeString = daysInRange ? `Time in Range | ${formatDaysRange(daysInRange)}` : '…';
    // JSX frag for estimated APR of position
    const days = <span className={styles.apr}>{daysInRangeString}</span>;

    const estimatedAPR = isOutOfRange ? (
        <div className={styles.apr_display_out_of_range}>
            <div>Est. APR | 0%</div>
        </div>
    ) : (
        <div className={styles.apr_display_in_range}>
            <div>{aprPercentageString}</div>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {currentPrice}
                {estimatedAPR}
            </div>
        </div>
    );
}
