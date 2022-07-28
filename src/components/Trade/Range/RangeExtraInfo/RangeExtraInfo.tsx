// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './RangeExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import truncateDecimals from '../../../../utils/data/truncateDecimals';

// interface for component props
interface RangeExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    slippageTolerance: string;
    liquidityProviderFee: number;
    quoteTokenIsBuy?: boolean;
    gasPriceinGwei: string;
    displayForBase: boolean;
    isTokenABase: boolean;
    daysInRangeEstimation: number;
}

// central react functional component
export default function RangeExtraInfo(props: RangeExtraInfoPropsIF) {
    const {
        tokenPair,
        gasPriceinGwei,
        // quoteTokenIsBuy,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        displayForBase,
        isTokenABase,
        daysInRangeEstimation,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const reverseDisplay = (isTokenABase && !displayForBase) || (!isTokenABase && displayForBase);
    const invertPrice = displayForBase;

    // console.log({ isTokenABase });
    // console.log({ displayForBase });
    // console.log({ reverseDisplay });
    // console.log({ invertPrice });
    // console.log({ poolPriceDisplay });

    const displayPrice = invertPrice ? 1 / poolPriceDisplay : poolPriceDisplay;
    const displayPriceStringTruncated =
        displayPrice < 2
            ? truncateDecimals(displayPrice, 6).toString()
            : truncateDecimals(displayPrice, 2).toString();

    // const priceLimitAfterSlippageAndFee = quoteTokenIsBuy
    //     ? truncateDecimals(
    //           (1 / poolPriceDisplay) *
    //               (1 - slippageTolerance / 100) *
    //               (1 - liquidityProviderFee / 100),
    //           4,
    //       )
    //     : truncateDecimals(
    //           (1 / poolPriceDisplay) * (1 + slippageTolerance) * (1 + liquidityProviderFee / 100),
    //           4,
    //       );
    const truncatedGasInGwei = truncateDecimals(parseFloat(gasPriceinGwei), 2);

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${displayPriceStringTruncated} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${displayPriceStringTruncated} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'slippage tolerance explanation',
            data: `${slippageTolerance}%`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: 'liquidity provider fee explanation',
            data: `${liquidityProviderFee}%`,
        },
        {
            title: 'Estimated Range Duration',
            tooltipTitle: 'range duration explanation',
            data: `${daysInRangeEstimation} Days`,
        },
    ];

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

    // const [baseTokenData, quoteTokenData] = isTokenABase
    //     ? [tokenPair.dataTokenA, tokenPair.dataTokenB]
    //     : [tokenPair.dataTokenB, tokenPair.dataTokenA];

    const defaultDisplay = `1 ${tokenPair.dataTokenA.symbol} ≈ ${displayPriceStringTruncated} ${tokenPair.dataTokenB.symbol}`;

    const flippedDisplay = `1 ${tokenPair.dataTokenB.symbol} ≈ ${displayPriceStringTruncated} ${tokenPair.dataTokenA.symbol}`;

    return (
        <>
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {truncatedGasInGwei} gwei
                </div>
                <div className={styles.token_amount}>
                    {reverseDisplay ? flippedDisplay : defaultDisplay}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </>
    );
}
