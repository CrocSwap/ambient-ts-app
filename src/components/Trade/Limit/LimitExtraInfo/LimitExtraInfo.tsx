// START: Import React and Dongles
import { memo, useContext, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { PoolContext } from '../../../../contexts/PoolContext';

// interface for component props
interface propsIF {
    orderGasPriceInDollars: string | undefined;
    isTokenABase: boolean;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
    isQtyEntered: boolean;
    liquidityProviderFeeString: string;
}

// central react functional component
function LimitExtraInfo(props: propsIF) {
    const {
        orderGasPriceInDollars,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        isQtyEntered,
        liquidityProviderFeeString,
    } = props;
    const { poolPriceDisplay } = useContext(PoolContext);

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
            : displayPriceWithDenom < 0.0001
            ? displayPriceWithDenom.toExponential(2)
            : displayPriceWithDenom < 2
            ? displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const startPriceString = !startDisplayPrice
        ? '…'
        : startDisplayPrice < 0.0001
        ? startDisplayPrice.toExponential(2)
        : startDisplayPrice < 2
        ? startDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : startDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const middlePriceString = !middleDisplayPrice
        ? '…'
        : middleDisplayPrice < 0.0001
        ? middleDisplayPrice.toExponential(2)
        : middleDisplayPrice < 2
        ? middleDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : middleDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const endPriceString = !endDisplayPrice
        ? '…'
        : endDisplayPrice < 0.0001
        ? endDisplayPrice.toExponential(2)
        : endDisplayPrice < 2
        ? endDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
          })
        : endDisplayPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'Current Price of the Selected Token Pool',
            data: isDenomBase
                ? `${displayPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${displayPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        // {
        //     title: 'Limit Price',
        //     tooltipTitle: 'limit price explanation',
        //     data: reverseDisplay
        //         ? `${limitRateNum} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
        //         : `${limitRateNum} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        // },
        {
            title: 'Fill Start',
            tooltipTitle:
                'Price at which the limit order will begin to be filled',
            data: isDenomBase
                ? `${startPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${startPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill Middle',
            tooltipTitle:
                'Average price at which the limit order will be filled',
            data: isDenomBase
                ? `${middlePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${middlePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill End',
            tooltipTitle:
                'Price at which the limit order will finish being filled and become claimable',
            data: isDenomBase
                ? `${endPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${endPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Minimum Rebate Rate',
            tooltipTitle:
                'The minimum provider fee for swaps in this pool. Provider fees are effectively rebated for limit orders.',
            data: '0.05%',
        },
        {
            title: 'Current Rebate Rate',
            tooltipTitle:
                'The current provider fee for swaps. Provider fees are effectively rebated for limit orders.',
            data: `${liquidityProviderFeeString}%`,
        },
    ];

    const limitExtraInfoDetails = (
        <div className={styles.extra_details_container}>
            <div className={styles.extra_details}>
                {extraInfoData.map((item, idx) => (
                    <div
                        className={styles.extra_row}
                        key={idx}
                        tabIndex={0}
                        aria-label={`${item.title} is ${item.data}`}
                    >
                        <div className={styles.align_center}>
                            <div>{item.title}</div>
                            <TooltipComponent title={item.tooltipTitle} />
                        </div>
                        <div className={styles.data}>{item.data}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? limitExtraInfoDetails : null;

    const dispatch = useAppDispatch();
    const [isConvHovered, setIsConHovered] = useState(false);

    const conversionRateDisplay = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

    const gasCostAriaLabel = `Gas cost is ${orderGasPriceInDollars}. Conversion rate is ${conversionRateDisplay} `;

    const extraInfoSectionOrNull = (
        <button
            className={`${styles.extra_info_content} ${
                isQtyEntered && styles.extra_info_content_active
            }`}
            onClick={
                isQtyEntered
                    ? () => setShowExtraDetails(!showExtraDetails)
                    : () => setShowExtraDetails(false)
            }
            tabIndex={0}
            aria-label={gasCostAriaLabel}
        >
            <div className={styles.gas_pump}>
                <FaGasPump size={15} className={styles.non_hoverable} />{' '}
                {orderGasPriceInDollars ? orderGasPriceInDollars : '…'}
            </div>
            <div
                className={styles.token_amount}
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
                onMouseEnter={() => setIsConHovered(true)}
                onMouseOut={() => setIsConHovered(false)}
            >
                {conversionRateDisplay}
            </div>
            {/* <DenominationSwitch /> */}
            {isQtyEntered && !showExtraDetails && (
                <RiArrowDownSLine
                    size={22}
                    className={
                        isConvHovered
                            ? styles.non_hovered_arrow
                            : styles.dropdown_arrow
                    }
                />
            )}
            {isQtyEntered && showExtraDetails && (
                <RiArrowUpSLine
                    size={22}
                    className={
                        isConvHovered
                            ? styles.non_hovered_arrow
                            : styles.dropdown_arrow
                    }
                />
            )}
        </button>
    );
    return (
        <div className={styles.main_container}>
            {extraInfoSectionOrNull}
            {extraDetailsOrNull}
        </div>
    );
}

export default memo(LimitExtraInfo);
