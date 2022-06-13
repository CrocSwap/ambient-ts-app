// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './ExtraInfo.module.css';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';

// interface for props in this file
interface ExtraInfoProps {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy: boolean;
    gasPriceinGwei: string;
    isDenomBase: boolean;
    isTokenABase: boolean;
}

// central react functional component
export default function ExtraInfo(props: ExtraInfoProps) {
    const {
        tokenPair,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        quoteTokenIsBuy,
        gasPriceinGwei,
        isDenomBase,
        isTokenABase,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const spotPriceDisplayQuoteForBase = truncateDecimals(1 / poolPriceDisplay, 4);

    const truncatedGasInGwei = truncateDecimals(parseFloat(gasPriceinGwei), 2);

    const priceLimitAfterSlippageAndFee = quoteTokenIsBuy
        ? truncateDecimals(
              (1 / poolPriceDisplay) *
                  (1 - slippageTolerance / 100) *
                  (1 - liquidityProviderFee / 100),
              4,
          )
        : truncateDecimals(
              (1 / poolPriceDisplay) * (1 + slippageTolerance) * (1 + liquidityProviderFee / 100),
              4,
          );

    const displayPriceString =
        spotPriceDisplayQuoteForBase === Infinity ? '' : spotPriceDisplayQuoteForBase.toString();

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: `${displayPriceString} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Price Limit after Slippage and Fee',
            tooltipTitle: 'price limit explanation',
            data: `${priceLimitAfterSlippageAndFee} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'slippage tolerance explanation',
            data: `${slippageTolerance}%`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: 'liquidity provider fee explanation',
            data: `${liquidityProviderFee}%`,
        },
    ];
    const extraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extra_row} key={idx}>
                    <div className={styles.align_center}>
                        <div>{item.title}</div>
                        <TooltipComponent title={item.title} />
                    </div>
                    <div>{item.data}</div>
                </div>
            ))}
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? extraInfoDetails : null;

    const [baseTokenData, quoteTokenData] = isTokenABase
        ? [tokenPair.dataTokenA, tokenPair.dataTokenB]
        : [tokenPair.dataTokenB, tokenPair.dataTokenA];

    const defaultDisplay =
        poolPriceDisplay < 1
            ? `1 ${baseTokenData.symbol} ≈ ${truncateDecimals(1 / poolPriceDisplay, 4)} ${
                  quoteTokenData.symbol
              }`
            : `1 ${quoteTokenData.symbol} ≈ ${poolPriceDisplay} ${baseTokenData.symbol}`;

    const flippedDisplay =
        poolPriceDisplay < 1
            ? `1 ${quoteTokenData.symbol} ≈ ${poolPriceDisplay} ${baseTokenData.symbol}`
            : `1 ${baseTokenData.symbol} ≈ ${truncateDecimals(1 / poolPriceDisplay, 4)} ${
                  quoteTokenData.symbol
              }`;

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
                    {isDenomBase ? defaultDisplay : flippedDisplay}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </div>
    );
}
