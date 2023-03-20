// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './RangeExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';

// interface for component props
interface propsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: string;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy?: boolean;
    rangeGasPriceinDollars: string | undefined;
    isDenomBase: boolean;
    isTokenABase: boolean;
    isQtyEntered: boolean;
    showExtraInfoDropdown: boolean;
    isBalancedMode: boolean;
}

// central react functional component
export default function RangeExtraInfo(props: propsIF) {
    const {
        tokenPair,
        rangeGasPriceinDollars,
        // quoteTokenIsBuy,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        isDenomBase,
        isTokenABase,
        // isQtyEntered,
        showExtraInfoDropdown,
        isBalancedMode,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

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
            data: `${liquidityProviderFee}%`,
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
            data: `${liquidityProviderFee}%`,
        },
    ];

    const extraInfoData = isBalancedMode ? extraInfoDataBalanced : extraInfoDataAdvanced;

    const RangeExtraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extra_row} key={idx}>
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

    const extraInfoSection = (
        <div
            className={styles.extra_info_content}
            onClick={
                showExtraInfoDropdown
                    ? () => setShowExtraDetails(!showExtraDetails)
                    : () => setShowExtraDetails(false)
            }
        >
            <div className={styles.gas_pump}>
                <FaGasPump size={15} /> {rangeGasPriceinDollars ? rangeGasPriceinDollars : '…'}
            </div>
            <div className={styles.token_amount}>
                {reverseDisplay
                    ? `1 ${tokenPair.dataTokenB.symbol} ≈ ${poolPriceDisplay} ${tokenPair.dataTokenA.symbol}`
                    : `1 ${tokenPair.dataTokenA.symbol} ≈ ${poolPriceDisplay} ${tokenPair.dataTokenB.symbol}`}
                {showExtraInfoDropdown && <RiArrowDownSLine size={27} />}
            </div>
        </div>
    );

    return (
        <>
            {extraInfoSection}
            {extraDetailsOrNull}
        </>
    );
}
