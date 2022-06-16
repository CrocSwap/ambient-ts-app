import styles from './AdvancedPriceInfo.module.css';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';
import truncateDecimals from '../../../../../utils/data/truncateDecimals';

interface AdvancedPriceInfoIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: string;
    isDenomBase: boolean;
    isTokenABase: boolean;
}

export default function AdvancedPriceInfo(props: AdvancedPriceInfoIF) {
    // JSX frag to display the pool price for the current pair
    const { tokenPair, poolPriceDisplay, isDenomBase, isTokenABase } = props;

    const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const displayPriceString = isDenomBase
        ? truncateDecimals(1 / parseFloat(poolPriceDisplay), 4).toString()
        : truncateDecimals(parseFloat(poolPriceDisplay), 4).toString();

    const currentPrice = (
        <div className={styles.price_info_row}>
            <div>Current Price: </div>
            <div className={styles.current_price}>
                {reverseDisplay
                    ? `${displayPriceString} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                    : `${displayPriceString} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`}
            </div>
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
