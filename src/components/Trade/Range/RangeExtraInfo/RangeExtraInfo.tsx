// START: Import React and Dongles
import { memo, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './RangeExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';

// interface for component props
interface propsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: string;
    slippageTolerance: number;
    liquidityProviderFeeString: string;
    quoteTokenIsBuy?: boolean;
    rangeGasPriceinDollars: string | undefined;
    isDenomBase: boolean;
    isTokenABase: boolean;
    isQtyEntered: boolean;
    showExtraInfoDropdown: boolean;
    isBalancedMode: boolean;
}

// central react functional component
function RangeExtraInfo(props: propsIF) {
    const {
        tokenPair,
        rangeGasPriceinDollars,
        // quoteTokenIsBuy,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFeeString,
        isDenomBase,
        isTokenABase,
        // isQtyEntered,
        showExtraInfoDropdown,
        isBalancedMode,
    } = props;

    const dispatch = useAppDispatch();

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const reverseDisplay =
        (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const extraInfoDataAdvanced = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${poolPriceDisplay} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${poolPriceDisplay} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'slippage tolerance explanation',
            data: `±${slippageTolerance}%`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: 'liquidity provider fee explanation',
            data: `${liquidityProviderFeeString}%`,
        },
    ];

    const extraInfoDataBalanced = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${poolPriceDisplay} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${poolPriceDisplay} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'slippage tolerance explanation',
            data: `±${slippageTolerance}%`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: 'liquidity provider fee explanation',
            data: `${liquidityProviderFeeString}%`,
        },
    ];

    const extraInfoData = isBalancedMode
        ? extraInfoDataBalanced
        : extraInfoDataAdvanced;

    const RangeExtraInfoDetails = (
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
                        <TooltipComponent title={item.title} />
                    </div>
                    <div className={styles.data}>{item.data}</div>
                </div>
            ))}
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? RangeExtraInfoDetails : null;

    const conversionRateDisplay = reverseDisplay
        ? `1 ${tokenPair.dataTokenB.symbol} ≈ ${poolPriceDisplay} ${tokenPair.dataTokenA.symbol}`
        : `1 ${tokenPair.dataTokenA.symbol} ≈ ${poolPriceDisplay} ${tokenPair.dataTokenB.symbol}`;

    const gasCostAriaLabel = `Gas cost is ${rangeGasPriceinDollars}. Conversion rate is ${conversionRateDisplay} `;

    const extraInfoSection = (
        <button
            className={`${styles.extra_info_content} ${
                showExtraInfoDropdown && styles.extra_info_content_active
            }`}
            onClick={
                showExtraInfoDropdown
                    ? () => setShowExtraDetails(!showExtraDetails)
                    : () => setShowExtraDetails(false)
            }
            aria-label={gasCostAriaLabel}
        >
            <div className={styles.gas_pump}>
                <FaGasPump size={15} />{' '}
                {rangeGasPriceinDollars ? rangeGasPriceinDollars : '…'}
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

            {showExtraInfoDropdown && !showExtraDetails && (
                <RiArrowDownSLine size={22} />
            )}
            {showExtraInfoDropdown && showExtraDetails && (
                <RiArrowUpSLine size={22} />
            )}
        </button>
    );

    return (
        <>
            {extraInfoSection}
            {extraDetailsOrNull}
        </>
    );
}

export default memo(RangeExtraInfo);
