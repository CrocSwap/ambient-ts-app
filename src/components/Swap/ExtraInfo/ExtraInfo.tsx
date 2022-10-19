// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './ExtraInfo.module.css';
// import truncateDecimals from '../../../utils/data/truncateDecimals';
// import makePriceDisplay from './makePriceDisplay';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocImpact } from '@crocswap-libs/sdk';

// interface for props in this file
interface ExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    priceImpact: CrocImpact | undefined;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy: boolean;
    swapGasPriceinDollars: string | undefined;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    isOnTradeRoute?: boolean;
}

// central react functional component
export default function ExtraInfo(props: ExtraInfoPropsIF) {
    const {
        // tokenPair,
        priceImpact,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        // quoteTokenIsBuy,
        swapGasPriceinDollars,
        // didUserFlipDenom,
        isTokenABase,
        isOnTradeRoute,
        // isDenomBase,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(
        isOnTradeRoute ? true : false,
    );

    // const truncatedGasInGwei = gasPriceInGwei ? truncateDecimals(gasPriceInGwei, 2) : undefined;

    // const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);
    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    // let reverseSlippage: boolean;

    // if (isDenomBase) {
    //     if (isTokenABase) {
    //         reverseSlippage = false;
    //     } else {
    //         reverseSlippage = true;
    //     }
    // } else {
    //     if (isTokenABase) {
    //         reverseSlippage = true;
    //     } else {
    //         reverseSlippage = false;
    //     }
    // }

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

    // const priceLimitAfterSlippageAndFee = reverseSlippage
    //     ? displayPriceWithDenom * (1 + slippageTolerance / 100) * (1 + liquidityProviderFee / 100)
    //     : displayPriceWithDenom * (1 - slippageTolerance / 100) * (1 - liquidityProviderFee / 100);

    // const priceAfterImpact = priceImpact?.finalPrice;

    const effectivePrice =
        parseFloat(priceImpact?.buyQty || '0') / parseFloat(priceImpact?.sellQty || '1');

    const isPriceInverted = (isDenomBase && !isTokenABase) || (!isDenomBase && isTokenABase);
    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    // useEffect(() => {
    //     console.log({ priceImpact });
    //     console.log({ effectivePriceWithDenom });
    // }, [priceImpact, effectivePriceWithDenom]);

    // const priceLimitAfterImpactAndFee = priceAfterImpactWithDenom
    //     ? reverseSlippage
    //         ? priceAfterImpactWithDenom * (1 + liquidityProviderFee / 100)
    //         : priceAfterImpactWithDenom * (1 - liquidityProviderFee / 100)
    //     : undefined;

    // const displayLimitPriceString =
    //     displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
    //         ? '…'
    //         : priceLimitAfterSlippageAndFee < 2
    //         ? priceLimitAfterSlippageAndFee.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 6,
    //           })
    //         : priceLimitAfterSlippageAndFee.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           });

    const displayEffectivePriceString =
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
            ? '…'
            : effectivePriceWithDenom < 2
            ? effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // const priceDisplay = makePriceDisplay(
    //     tokenPair.dataTokenA,
    //     tokenPair.dataTokenB,
    //     isTokenABase,
    //     poolPriceDisplay,
    //     didUserFlipDenom,
    // );

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'Current Price of the Selected Token Pool',
            data: isDenomBase
                ? `${displayPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${displayPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Effective Conversion Rate',
            tooltipTitle: 'Conversion Rate After Swap Impact and Fees',
            data: isDenomBase
                ? `${displayEffectivePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${displayEffectivePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            // data: isDenomBase
            //     ? `${displayLimitPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
            //     : `${displayLimitPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
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
        <>
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {swapGasPriceinDollars ? swapGasPriceinDollars : '…'}
                    {/* {truncatedGasInGwei ? `${truncatedGasInGwei} gwei` : '…'} */}
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
