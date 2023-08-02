import styles from './AdvancedPriceInfo.module.css';
import { memo } from 'react';

interface propsIF {
    poolPriceDisplay: string;
    isTokenABase: boolean;
    isOutOfRange: boolean;
    aprPercentage: number | undefined;
}

function AdvancedPriceInfo(props: propsIF) {
    // JSX frag to display the pool price for the current pair
    const { isOutOfRange, aprPercentage } = props;

    const aprPercentageString = aprPercentage
        ? `${aprPercentage.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';

    const estimatedAPRValue = isOutOfRange ? (
        <p className={styles.apr_display_out_of_range}>0%</p>
    ) : (
        <p className={styles.apr_display_in_range}>{aprPercentageString}</p>
    );

    const estimatedAPR = (
        <div
            className={styles.price_info_row}
            tabIndex={aprPercentage ? 0 : -1}
            aria-label={`Estimated APR is ${aprPercentageString} percent.`}
        >
            <p className={styles.row_label}>Est. APR </p>
            {estimatedAPRValue}
        </div>
    );

    return <div className={styles.price_info_container}>{estimatedAPR}</div>;
}

export default memo(AdvancedPriceInfo);
