// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';

// interface for component props
interface propsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    liquidityProviderFee: number;
    orderGasPriceInDollars: string | undefined;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    limitRate: string;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
    isQtyEntered: boolean;
}

// central react functional component
export default function LimitExtraInfo(props: propsIF) {
    const {
        orderGasPriceInDollars,
        poolPriceDisplay,
        liquidityProviderFee,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        isQtyEntered,
    } = props;
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPriceWithDenom = isDenomBase
        ? 1 / poolPriceDisplay
        : poolPriceDisplay;

    const displayPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
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
            tooltipTitle: 'Fill Start Explanation',
            data: isDenomBase
                ? `${startPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${startPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill Middle',
            tooltipTitle: 'Fill Middle Explanation',
            data: isDenomBase
                ? `${middlePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${middlePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill End',
            tooltipTitle: 'Fill End Explanation',
            data: isDenomBase
                ? `${endPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${endPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Minimum Rebate Rate',
            tooltipTitle:
                'The minimum provider fee for market orders in this pool. Provider fees are effectively rebated for limit orders.',
            data: '0.05%',
        },
        {
            title: 'Current Rebate Rate',
            tooltipTitle:
                'The current provider fee for market orders. Provider fees are effectively rebated for limit orders.',
            data: `${liquidityProviderFee}%`,
        },
    ];

    const limitExtraInfoDetails = (
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
    );

    const extraDetailsOrNull = showExtraDetails ? limitExtraInfoDetails : null;

    const dropDownOrNull = isQtyEntered ? (
        <div style={{ cursor: 'pointer' }}>
            {!showExtraDetails && <RiArrowDownSLine size={22} />}
            {showExtraDetails && <RiArrowUpSLine size={22} />}
        </div>
    ) : null;

    const dispatch = useAppDispatch();

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
                <FaGasPump size={15} />{' '}
                {orderGasPriceInDollars ? orderGasPriceInDollars : '…'}
            </div>
            <div
                className={styles.token_amount}
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {conversionRateDisplay}
            </div>
            {/* <DenominationSwitch /> */}
            {dropDownOrNull}
        </button>
    );
    return (
        <>
            {extraInfoSectionOrNull}
            {extraDetailsOrNull}
        </>
    );
}
