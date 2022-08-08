import styles from './AdvancedPriceInfo.module.css';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';
import truncateDecimals from '../../../../../utils/data/truncateDecimals';

interface AdvancedPriceInfoIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: string;
    isDenomBase: boolean;
    isTokenABase: boolean;
    minimumSpan: number;
    isOutOfRange: boolean | undefined;
}

export default function AdvancedPriceInfo(props: AdvancedPriceInfoIF) {
    // JSX frag to display the pool price for the current pair
    const { tokenPair, poolPriceDisplay, isDenomBase, isTokenABase, minimumSpan, isOutOfRange } =
        props;

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

    // JSX frag to display the estimated APY of the position
    const estimatedAPY = (
        <div
            className={isOutOfRange ? styles.apy_display_out_of_range : styles.apy_display_in_range}
        >
            <div>
                Est. APY | {isOutOfRange ? 0 : truncateDecimals(100 - minimumSpan / 100 + 10, 0)}%
            </div>
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
