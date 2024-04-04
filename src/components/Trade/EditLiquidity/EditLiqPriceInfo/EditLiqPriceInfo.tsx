import { useLocation } from 'react-router-dom';
import { FlexContainer, Text } from '../../../../styled/Common';
import styles from './EditLiqPriceInfo.module.css';
import { PositionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { useContext, useMemo, useState } from 'react';
import { RangeContext } from '../../../../contexts/RangeContext';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    getFormattedNumber,
    getPinnedPriceValuesFromTicks,
} from '../../../../ambient-utils/dataLayer';

export default function EditLiqPriceInfo() {
    const {
        isDenomBase,
        poolPriceNonDisplay: currentPoolPriceNonDisplay,
        getDefaultRangeWidthForTokenPair,
    } = useContext(TradeDataContext);

    const {
        simpleRangeWidth,

        // eslint-disable-next-line
        setAdvancedHighTick,
        // eslint-disable-next-line
        setAdvancedLowTick,
    } = useContext(RangeContext);
    const locationHook = useLocation();
    const { position } = locationHook.state as { position: PositionIF };
    console.log({ position });

    const currentPoolPriceTick =
        Math.log(currentPoolPriceNonDisplay) / Math.log(1.0001);
    // eslint-disable-next-line
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(
        simpleRangeWidth === 100
            ? 100
            : getDefaultRangeWidthForTokenPair(
                  position.chainId,
                  position.base.toLowerCase(),
                  position.quote.toLowerCase(),
              ),
    );

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        position.baseDecimals,
        position.quoteDecimals,
        lowTick,
        highTick,
        lookupChain(position.chainId).gridSize,
    );
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
                <Text color='white'>...</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>USDC</Text>
                <Text color='text2'>{quoteQty}</Text>
                <Text color='white'>...</Text>
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
                        : minPriceDisplay}
                </Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>Max Price</Text>
                <Text color='text2'>{currentMaxPrice}</Text>
                <Text color='white'>
                    {/* {isCurrentPositionEmpty
                            ? '...'
                            : rangeWidthPercentage === 100
                            ? '∞'
                        : maxPriceDisplay} */}
                    ...
                </Text>
            </div>

            <span className={styles.divider} />

            <div className={styles.row_item}>
                <Text color='white'>Value</Text>
                <Text color='text2'>{usdRemovalValue}</Text>
                <Text color='negative'>...</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>Price Impact</Text>
                <p />
                <Text color='negative'>(1.56%)</Text>
            </div>
        </FlexContainer>
    );
}
