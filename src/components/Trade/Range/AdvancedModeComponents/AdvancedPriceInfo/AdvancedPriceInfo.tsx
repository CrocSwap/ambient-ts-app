import styles from './AdvancedPriceInfo.module.css';
import { memo } from 'react';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

interface propsIF {
    poolPriceDisplay: string;
    isTokenABase: boolean;
    isOutOfRange: boolean;
    aprPercentage: number | undefined;
}

function AdvancedPriceInfo(props: propsIF) {
    // JSX frag to display the pool price for the current pair
    const { poolPriceDisplay, isTokenABase, isOutOfRange, aprPercentage } =
        props;
    const { isDenomBase, tokenA, tokenB } = useAppSelector(
        (state) => state.tradeData,
    );

    const reverseDisplay =
        (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const currentPriceValue = reverseDisplay
        ? `${poolPriceDisplay} ${tokenA.symbol} per ${tokenB.symbol}`
        : `${poolPriceDisplay} ${tokenB.symbol} per ${tokenA.symbol}`;

    const currentPrice = (
        <div
            className={styles.price_info_row}
            tabIndex={0}
            aria-label={`Current price is ${currentPriceValue}. `}
        >
            <div>Current Price: </div>
            <div className={styles.current_price}>{currentPriceValue}</div>
        </div>
    );

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';

    const estimatedAPR = isOutOfRange ? (
        <div className={styles.apr_display_out_of_range}>
            <div>Est. APR | 0%</div>
        </div>
    ) : (
        <div
            className={styles.apr_display_in_range}
            tabIndex={aprPercentage ? 0 : -1}
            aria-label={`Estimated APR is ${aprPercentageString} percent.`}
        >
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

export default memo(AdvancedPriceInfo);
