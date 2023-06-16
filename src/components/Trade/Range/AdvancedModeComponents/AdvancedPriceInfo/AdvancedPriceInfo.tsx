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
        ? `${poolPriceDisplay}  ${tokenB.symbol}`
        : `${poolPriceDisplay}  per ${tokenA.symbol}`;

    const currentPrice = (
        <div
            className={styles.price_info_row}
            tabIndex={0}
            aria-label={`Current price is ${currentPriceValue}. `}
        >
            <p className={styles.row_label}>Current Price </p>
            <p className={styles.current_price}>{currentPriceValue}</p>
        </div>
    );

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';

    const estimatedAPRValue = isOutOfRange ? (
        <p className={styles.apr_display_out_of_range}>Est. APR | 0%</p>
    ) : (
        <p className={styles.apr_display_in_range}>{aprPercentageString}</p>
    );

    const estimatedAPR = (
        <div
            className={styles.price_info_row}
            tabIndex={aprPercentage ? 0 : -1}
            aria-label={`Estimated APR is ${aprPercentageString} percent.`}
        >
            <p className={styles.row_label}>Est.APY </p>
            {estimatedAPRValue}
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
