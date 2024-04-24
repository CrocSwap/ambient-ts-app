import { useLocation } from 'react-router-dom';
import { FlexContainer, Text } from '../../../../styled/Common';
import styles from './EditLiqPriceInfo.module.css';
import { PositionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { useContext, useMemo, useState } from 'react';
import { RangeContext } from '../../../../contexts/RangeContext';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';

interface propsIF {
    rangeWidthPercentage: number;
}
export default function EditLiqPriceInfo(props: propsIF) {
    const { rangeWidthPercentage } = props;
    const { isDenomBase } = useContext(TradeDataContext);

    const locationHook = useLocation();
    const { position } = locationHook.state as { position: PositionIF };
    const { pinnedDisplayPrices } = useContext(RangeContext);

    // eslint-disable-next-line

    // eslint-disable-next-line
    const [currentBaseQtyDisplayTruncated, setCurrentBaseQtyDisplayTruncated] =
        useState<string>(position?.positionLiqBaseTruncated || '...');

    const [
        currentQuoteQtyDisplayTruncated,
        // eslint-disable-next-line
        setCurrentQuoteQtyDisplayTruncated,
    ] = useState<string>(position?.positionLiqQuoteTruncated || '...');

    const pinnedMinPriceDisplayTruncated = pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMinPriceDisplayTruncated
        : undefined;
    const pinnedMaxPriceDisplayTruncated = pinnedDisplayPrices
        ? pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated
        : undefined;

    const currentMinPrice = isDenomBase
        ? position?.lowRangeDisplayInBase
        : position?.lowRangeDisplayInQuote;

    const currentMaxPrice = isDenomBase
        ? position?.highRangeDisplayInBase
        : position?.highRangeDisplayInQuote;
    // eslint-disable-next-line
    const [minPriceDisplay, setMinPriceDisplay] = useState<string>(
        pinnedMinPriceDisplayTruncated || '...',
    );
    // eslint-disable-next-line
    const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(
        pinnedMaxPriceDisplayTruncated || '...',
    );

    const isCurrentPositionEmpty =
        currentBaseQtyDisplayTruncated === '0.00' &&
        currentQuoteQtyDisplayTruncated === '0.00';

    const baseQty = position.positionLiqBaseTruncated;

    const quoteQty = position.positionLiqQuoteTruncated;

    const usdRemovalValue = useMemo(
        () =>
            getFormattedNumber({
                value: position.totalValueUSD,
                prefix: '$',
            }),
        [position],
    );

    const pinnedMinDisplay =
        pinnedDisplayPrices?.pinnedMinPriceDisplayTruncated;
    const pinnedMaxDisplay =
        pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncated;

    const newBaseValue = document.getElementById(
        'range_A_qty',
    ) as HTMLInputElement;
    const newQuoteValue = document.getElementById(
        'range_B_qty',
    ) as HTMLInputElement;

    return (
        <FlexContainer flexDirection='column'>
            <div className={styles.row_item_header}>
                <p />
                <Text color='text2'>Current</Text>
                <Text color='text2'>New</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>ETH</Text>
                <Text color='text2'>{baseQty}</Text>
                <Text color='white'>
                    {Number(newBaseValue?.value)?.toFixed(2) ?? '...'}
                </Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>USDC</Text>
                <Text color='text2'>{quoteQty}</Text>
                <Text color='white'>
                    {Number(newQuoteValue?.value)?.toFixed(2) ?? '...'}
                </Text>
            </div>

            <span className={styles.divider} />

            <div className={styles.row_item}>
                <Text color='white'>Min Price</Text>
                <Text color='text2'>{currentMinPrice}</Text>
                <Text color='white'>
                    {isCurrentPositionEmpty
                        ? '...'
                        : rangeWidthPercentage === 100
                        ? '0'
                        : pinnedMinDisplay ?? minPriceDisplay}
                </Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>Max Price</Text>
                <Text color='text2'>{currentMaxPrice}</Text>
                <Text color='white'>
                    {isCurrentPositionEmpty
                        ? '...'
                        : rangeWidthPercentage === 100
                        ? '∞'
                        : pinnedMaxDisplay ?? maxPriceDisplay}
                </Text>
            </div>

            <span className={styles.divider} />

            <div className={styles.row_item}>
                <Text color='white'>Value</Text>
                <Text color='text2'>{usdRemovalValue}</Text>
                <Text color='negative'>...</Text>
            </div>

            {/* <div className={styles.row_item}>
                <Text color='white'>Price Impact</Text>
                <p />
                <Text color='negative'>(1.56%)</Text>
            </div> */}
        </FlexContainer>
    );
}
