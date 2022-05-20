import styles from './LimitExtraInfo.module.css';
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';
// import truncateDecimals from '../../../utils/data/truncateDecimals';

// interface LimitExtraInfoProps {
//     poolPriceDisplay: number;
//     slippageTolerance: number;
//     liquidityProviderFee: number;
//     quoteTokenIsBuy: boolean;
//     gasPriceinGwei: string;
// }

export default function LimitExtraInfo() {
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    // const spotPriceDisplayQuoteForBase = truncateDecimals(1 / props.poolPriceDisplay, 4);

    // const truncatedGasInGwei = truncateDecimals(parseFloat(props.gasPriceinGwei), 2);

    // const slippageTolerance = props.slippageTolerance;
    // const liquidityProviderFee = props.liquidityProviderFee;

    // const priceLimitAfterSlippageAndFee = props.quoteTokenIsBuy
    //     ? truncateDecimals(
    //           (1 / props.poolPriceDisplay) *
    //               (1 - slippageTolerance / 100) *
    //               (1 - liquidityProviderFee / 100),
    //           4,
    //       )
    //     : truncateDecimals(
    //           (1 / props.poolPriceDisplay) *
    //               (1 + slippageTolerance) *
    //               (1 + liquidityProviderFee / 100),
    //           4,
    //       );

    // TEMP DATA TO RENDER UI
    const spotPriceDisplayQuoteForBase = 1310.7276;
    const priceLimitAfterSlippageAndFee = 1241.4556;
    const slippageTolerance = 5;
    const liquidityProviderFee = 0.3;
    const truncatedGasInGwei = 2.5;

    const LimitExtraInfoDetails = (
        <div className={styles.extra_details}>
            <div className={styles.extra_row}>
                <span>Spot Price</span>
                <span>{spotPriceDisplayQuoteForBase} DAI per ETH</span>
            </div>
            <div className={styles.extra_row}>
                <span>Price Limit after Slippage and Fee</span>
                <span>{priceLimitAfterSlippageAndFee} DAI per ETH</span>
            </div>
            <div className={styles.extra_row}>
                <span>Slippage Tolerance</span>
                <span>{slippageTolerance}%</span>
            </div>
            <div className={styles.extra_row}>
                <span>Liquidity Provider Fee</span>
                <span>{liquidityProviderFee}%</span>
            </div>
        </div>
    );

    const ExtraDetailsOrNull = showExtraDetails ? LimitExtraInfoDetails : null;

    return (
        <div className={styles.extra_info_container}>
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {truncatedGasInGwei} gwei
                </div>
                <div className={styles.token_amount}>
                    1 ETH = {spotPriceDisplayQuoteForBase} DAI
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {ExtraDetailsOrNull}
        </div>
    );
}
