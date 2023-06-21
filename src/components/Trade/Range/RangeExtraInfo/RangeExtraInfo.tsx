// START: Import React and Dongles
import { memo, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './RangeExtraInfo.module.css';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';

// interface for component props
interface propsIF {
    poolPriceDisplay: string;
    slippageTolerance: number;
    liquidityProviderFeeString: string;
    rangeGasPriceinDollars: string | undefined;
    isTokenABase: boolean;
    showExtraInfoDropdown: boolean;
    isBalancedMode: boolean;
}

// central react functional component
function RangeExtraInfo(props: propsIF) {
    const {
        rangeGasPriceinDollars,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFeeString,
        isTokenABase,
        showExtraInfoDropdown,
        isBalancedMode,
    } = props;

    const { isDenomBase, tokenA, tokenB } = useAppSelector(
        (state) => state.tradeData,
    );

    const dispatch = useAppDispatch();

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const reverseDisplay =
        (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const extraInfoDataAdvanced = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${poolPriceDisplay} ${tokenA.symbol} per ${tokenB.symbol}`
                : `${poolPriceDisplay} ${tokenB.symbol} per ${tokenA.symbol}`,
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
                ? `${poolPriceDisplay} ${tokenA.symbol} per ${tokenB.symbol}`
                : `${poolPriceDisplay} ${tokenB.symbol} per ${tokenA.symbol}`,
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
                            <TooltipComponent title={item.title} />
                        </div>
                        <div className={styles.data}>{item.data}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? RangeExtraInfoDetails : null;

    const [isConvHovered, setIsConHovered] = useState(false);

    const conversionRateDisplay = reverseDisplay
        ? `1 ${tokenB.symbol} ≈ ${poolPriceDisplay} ${tokenA.symbol}`
        : `1 ${tokenA.symbol} ≈ ${poolPriceDisplay} ${tokenB.symbol}`;

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
                onMouseEnter={() => setIsConHovered(true)}
                onMouseOut={() => setIsConHovered(false)}
            >
                {conversionRateDisplay}
            </div>

            {showExtraInfoDropdown && !showExtraDetails && (
                <RiArrowDownSLine
                    size={22}
                    className={
                        isConvHovered
                            ? styles.non_hovered_arrow
                            : styles.dropdown_arrow
                    }
                />
            )}
            {showExtraInfoDropdown && showExtraDetails && (
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
            {extraInfoSection}
            {extraDetailsOrNull}
        </div>
    );
}

export default memo(RangeExtraInfo);
