// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
// import makePriceDisplay from './makePriceDisplay';

// interface for component props
interface LimitExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy?: boolean;
    orderGasPriceInDollars: string | undefined;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    limitRate: string;
}

// central react functional component
export default function LimitExtraInfo(props: LimitExtraInfoPropsIF) {
    const {
        // tokenPair,
        orderGasPriceInDollars,
        // quoteTokenIsBuy,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        // didUserFlipDenom,
        isTokenABase,
        // isDenomBase,
        // limitRate,
    } = props;
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    // const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

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

    const displayPriceWithDenom = isDenomBase ? 1 / poolPriceDisplay : poolPriceDisplay;

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

    // const limitRateString = truncateDecimals(parseFloat(limitRate), 2);

    // const displayPriceString = isDenomBase
    //     ? truncateDecimals(1 / poolPriceDisplay, 2)
    //     : truncateDecimals(poolPriceDisplay, 2);

    const priceLimitAfterSlippageAndFee = reverseSlippage
        ? displayPriceWithDenom * (1 + slippageTolerance / 100) * (1 + liquidityProviderFee / 100)
        : displayPriceWithDenom * (1 - slippageTolerance / 100) * (1 - liquidityProviderFee / 100);

    const displayLimitPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
            : priceLimitAfterSlippageAndFee < 2
            ? priceLimitAfterSlippageAndFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : priceLimitAfterSlippageAndFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    // const priceLimitAfterSlippageAndFee = reverseSlippage
    //     ? truncateDecimals(
    //           parseFloat(limitRateString) *
    //               (1 + slippageTolerance / 100) *
    //               (1 + liquidityProviderFee / 100),
    //           4,
    //       )
    //     : truncateDecimals(
    //           parseFloat(limitRateString) *
    //               (1 - slippageTolerance / 100) *
    //               (1 - liquidityProviderFee / 100),
    //           4,
    //       );

    // const truncatedGasInGwei = gasPriceInGwei ? truncateDecimals(gasPriceInGwei, 2) : undefined;

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
            title: 'Limit Price',
            tooltipTitle: 'Price Limit After Maximum Slippage',
            data: isDenomBase
                ? `${displayLimitPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${displayLimitPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill Start',
            tooltipTitle: 'Fill Start Explanation',
            data: isDenomBase ? `${'...'}  ${baseTokenSymbol}` : `${'...'}  ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill End',
            tooltipTitle: 'Fill End Explanation',
            data: isDenomBase ? `${'...'}  ${baseTokenSymbol}` : `${'...'}  ${quoteTokenSymbol}`,
        },
        {
            title: 'Minimum Rebate Rate',
            tooltipTitle: 'Minimum Rebate Rate',
            data: '0.05%',
        },
        {
            title: 'Current Rebate Rate',
            tooltipTitle: 'Current Rebate Rate',
            data: '0.3%',
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

    const limitExtraInfoDetails = (
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

    const extraDetailsOrNull = showExtraDetails ? limitExtraInfoDetails : null;

    // const priceDisplay = makePriceDisplay(
    //     tokenPair.dataTokenA,
    //     tokenPair.dataTokenB,
    //     isTokenABase,
    //     poolPriceDisplay,
    //     didUserFlipDenom,
    // );

    return (
        <>
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {orderGasPriceInDollars ? orderGasPriceInDollars : '…'}
                </div>
                <div className={styles.token_amount}>
                    {isDenomBase
                        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
                        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </>
    );
}
