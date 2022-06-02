import styles from './ExtraInfo.module.css';
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

interface ExtraInfoProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy: boolean;
    gasPriceinGwei: string;
}

export default function ExtraInfo(props: ExtraInfoProps) {
    const {
        tokenPair,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        quoteTokenIsBuy,
        gasPriceinGwei,
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

    const extraInfoDetails = (
        <div className={styles.extra_details}>
            <div className={styles.extra_row}>
                <span>Spot Price</span>
                <span>
                    {spotPriceDisplayQuoteForBase} {tokenPair.dataTokenB.symbol} per{' '}
                    {tokenPair.dataTokenA.symbol}
                </span>
            </div>
            <div className={styles.extra_row}>
                <span>Price Limit after Slippage and Fee</span>
                <span>
                    {priceLimitAfterSlippageAndFee} {tokenPair.dataTokenB.symbol} per{' '}
                    {tokenPair.dataTokenA.symbol}
                </span>
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

    const ExtraDetailsOrNull = showExtraDetails ? extraInfoDetails : null;

    // TODO:  right now we're hardcoding where token A symbol and token B symbol
    // TODO:  ... are being displayed, we'll need to add logic to sort once we
    // TODO:  ... have a different method of sorting the denomination and have
    // TODO:  ... functionality for the user to toggle denomination in the app

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
                    1 {tokenPair.dataTokenA.symbol} = {spotPriceDisplayQuoteForBase}{' '}
                    {tokenPair.dataTokenB.symbol}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {ExtraDetailsOrNull}
        </div>
    );
}
