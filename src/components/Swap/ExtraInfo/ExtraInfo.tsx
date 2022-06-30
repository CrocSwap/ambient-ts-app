// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './ExtraInfo.module.css';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import makePriceDisplay from './makePriceDisplay';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';

// interface for props in this file
interface ExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy: boolean;
    gasPriceinGwei: string;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
}

// central react functional component
export default function ExtraInfo(props: ExtraInfoPropsIF) {
    const {
        tokenPair,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        // quoteTokenIsBuy,
        gasPriceinGwei,
        didUserFlipDenom,
        isTokenABase,
        isDenomBase,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const truncatedGasInGwei = truncateDecimals(parseFloat(gasPriceinGwei), 2);

    const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    let reverseSlippage: boolean;

    if (isDenomBase) {
        if (isTokenABase) {
            reverseSlippage = false;
        } else {
            reverseSlippage = true;
        }
    } else {
        if (isTokenABase) {
            reverseSlippage = true;
        } else {
            reverseSlippage = false;
        }
    }

    const displayPriceString = isDenomBase
        ? truncateDecimals(1 / poolPriceDisplay, 4).toString()
        : truncateDecimals(poolPriceDisplay, 4).toString();

    const priceLimitAfterSlippageAndFee = reverseSlippage
        ? truncateDecimals(
              parseFloat(displayPriceString) *
                  (1 + slippageTolerance / 100) *
                  (1 + liquidityProviderFee / 100),
              4,
          )
        : truncateDecimals(
              parseFloat(displayPriceString) *
                  (1 - slippageTolerance / 100) *
                  (1 - liquidityProviderFee / 100),
              4,
          );

    const priceDisplay = makePriceDisplay(
        tokenPair.dataTokenA,
        tokenPair.dataTokenB,
        isTokenABase,
        poolPriceDisplay,
        didUserFlipDenom,
    );

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'Current Price of the Selected Token Pool',
            data: reverseDisplay
                ? `${displayPriceString} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${displayPriceString} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Price Limit',
            tooltipTitle: 'Price Limit After Slippage and Fees',
            data: reverseDisplay
                ? `${priceLimitAfterSlippageAndFee} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${priceLimitAfterSlippageAndFee} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
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
                        <TooltipComponent title={item.tooltipTitle} />
                    </div>
                    <div className={styles.data}>{item.data}</div>
                </div>
            ))}
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? extraInfoDetails : null;

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
                    {priceDisplay}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </div>
    );
}
