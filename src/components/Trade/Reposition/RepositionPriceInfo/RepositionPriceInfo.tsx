import { useContext, useMemo, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { PositionIF } from '../../../../ambient-utils/types';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import styles from './RepositionPriceInfo.module.css';

interface IRepositionPriceInfoProps {
    position: PositionIF;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    isConfirmModal?: boolean;
    minPriceDisplay: string;
    maxPriceDisplay: string;
    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;
    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    rangeGasPriceinDollars: string | undefined;
    currentMinPrice: string;
    currentMaxPrice: string;
    newValueString: string;
    valueImpactString: string;
    valueLossExceedsThreshold: boolean;
    isCurrentPositionEmpty: boolean;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    const {
        position,
        currentPoolPriceDisplay,
        rangeWidthPercentage,
        minPriceDisplay,
        maxPriceDisplay,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        rangeGasPriceinDollars,
        currentMinPrice,
        currentMaxPrice,
        newValueString,
        // valueImpactString,
        valueLossExceedsThreshold,
        isCurrentPositionEmpty,
    } = props;

    const { repoSlippage } = useContext(UserPreferenceContext);
    const { liquidityFee } = useContext(GraphDataContext);

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;

    const { isDenomBase } = useContext(TradeDataContext);

    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + '%'
        : '...';

    const usdRemovalValue = useMemo(
        () =>
            getFormattedNumber({
                value: position.totalValueUSD,
                prefix: '$',
            }),
        [position],
    );

    // JSX frag for estimated APR of position
    interface RowDisplayPropsIF {
        item1: string | number;
        item2: string | number;
        item3: string | number;
        negative?: boolean;
    }
    function RowDisplay(props: RowDisplayPropsIF) {
        const { item1, item2, item3, negative } = props;

        return (
            <div className={styles.row_display}>
                <p>{item1 ? item1 : ''}</p>
                <p>{item2 ? item2 : ''}</p>
                <p style={negative ? { color: 'var(--other-red)' } : undefined}>
                    {item3 ? item3 : ''}
                </p>
            </div>
        );
    }

    const feesAndSlippageData = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            // eslint-disable-next-line no-irregular-whitespace
            data: `${repoSlippage.volatile} %`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${
                isDenomBase ? baseSymbol : quoteSymbol
            } / ${isDenomBase ? quoteSymbol : baseSymbol} liquidity providers.`,
            // eslint-disable-next-line no-irregular-whitespace
            data: liquidityProviderFeeString,
            placement: 'bottom',
        },
    ];

    const [showExtraDetails, setShowExtraDetails] = useState(false);
    const priceImpact = true;

    const dropDownOrNull = priceImpact ? (
        <p style={{ cursor: 'pointer', marginTop: '4px' }}>
            {!showExtraDetails && <RiArrowDownSLine size={22} />}
            {showExtraDetails && <RiArrowUpSLine size={22} />}
        </p>
    ) : null;

    const conversionRateDisplay = isDenomBase
        ? `1 ${baseSymbol} ≈ ${currentPoolPriceDisplay} ${quoteSymbol}`
        : `1 ${quoteSymbol} ≈ ${currentPoolPriceDisplay} ${baseSymbol}`;

    const gasCostAriaLabel = `Gas cost is ${rangeGasPriceinDollars}. Conversion rate is ${conversionRateDisplay} `;

    const gasPriceDropdown = (
        <section className={styles.gas_pump_dropdown}>
            <button onClick={() => setShowExtraDetails(!showExtraDetails)}>
                <p aria-label={gasCostAriaLabel}>
                    <FaGasPump size={15} />
                    {rangeGasPriceinDollars ? rangeGasPriceinDollars : '…'}
                </p>
                <p>{conversionRateDisplay}</p>
                {dropDownOrNull}
            </button>

            {showExtraDetails && (
                <div className={styles.dropdown_content}>
                    {feesAndSlippageData.map((item, idx) =>
                        item ? (
                            <div
                                className={styles.extra_row}
                                key={idx}
                                tabIndex={0}
                                aria-label={`${item.title} is ${item.data}`}
                            >
                                <div className={styles.align_center}>
                                    <p>{item.title}</p>
                                    <TooltipComponent
                                        title={item.tooltipTitle}
                                        placement={item.placement as 'bottom'}
                                    />
                                </div>
                                <p className={styles.data}>{item.data}</p>
                            </div>
                        ) : null,
                    )}
                </div>
            )}
        </section>
    );

    const isLoading =
        newBaseQtyDisplay === '...' || newQuoteQtyDisplay === '...';

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {/* {!isConfirmModal ? apr : null} */}
                <aside className={styles.divider} />

                <RowDisplay item1='' item2='Current' item3='Est. New' />
                <aside className={styles.divider} />

                <RowDisplay
                    item1={position?.baseSymbol}
                    item2={currentBaseQtyDisplayTruncated}
                    item3={isCurrentPositionEmpty ? '...' : newBaseQtyDisplay}
                />
                <RowDisplay
                    item1={position?.quoteSymbol}
                    item2={currentQuoteQtyDisplayTruncated}
                    item3={isCurrentPositionEmpty ? '...' : newQuoteQtyDisplay}
                />
                <aside className={styles.divider} />

                <RowDisplay
                    item1='Min Price'
                    item2={currentMinPrice}
                    item3={
                        isCurrentPositionEmpty
                            ? '...'
                            : rangeWidthPercentage === 100
                              ? '0'
                              : minPriceDisplay
                    }
                />
                <RowDisplay
                    item1='Max Price'
                    item2={currentMaxPrice}
                    item3={
                        isCurrentPositionEmpty
                            ? '...'
                            : rangeWidthPercentage === 100
                              ? '∞'
                              : maxPriceDisplay
                    }
                />
                <aside className={styles.divider} />

                <RowDisplay
                    item1='Value'
                    item2={usdRemovalValue}
                    item3={
                        isCurrentPositionEmpty || isLoading
                            ? '...'
                            : newValueString
                    }
                    negative={!isLoading && valueLossExceedsThreshold}
                />
                {/* <RowDisplay
                    item1='Impact'
                    item2={''}
                    item3={
                        isCurrentPositionEmpty || isLoading
                            ? '...'
                            : valueImpactString
                    }
                    negative={!isLoading && valueLossExceedsThreshold}
                /> */}
            </div>
            {gasPriceDropdown}
        </div>
    );
}
