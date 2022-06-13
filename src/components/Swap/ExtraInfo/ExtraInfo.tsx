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

    function makePriceDisplay(symbolTokenA: string, symbolTokenB: string, displayPrice: number) {
        const shouldBeFlipped = () => {
            if (isTokenABase) {
                if (isDenomBase) {
                    return true;
                } else if (!isDenomBase) {
                    return false;
                }
            } else if (!isTokenABase) {
                if (isDenomBase) {
                    return false;
                } else if (!isDenomBase) {
                    return true;
                }
            }
        };
        const flipped = shouldBeFlipped();
        const formattedDisplayPrice =
            displayPrice > 1 ? displayPrice : truncateDecimals(displayPrice, 6);
        const makeTemplate = (symbolOne: string, price: number, symbolTwo: string) =>
            `1 ${symbolOne} = ${price} ${symbolTwo}`;
        const output = makeTemplate(
            flipped ? symbolTokenA : symbolTokenB,
            flipped ? truncateDecimals(1 / formattedDisplayPrice, 6) : formattedDisplayPrice,
            flipped ? symbolTokenB : symbolTokenA,
        );
        return output;
    }

    // const priceDisplay = makePriceDisplay(
    //     tokenPair.dataTokenA.symbol,
    //     tokenPair.dataTokenB.symbol,
    //     poolPriceDisplay,
    // );

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
                    1 {tokenPair.dataTokenA.symbol} = {displayPriceString}{' '}
                    {tokenPair.dataTokenB.symbol}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </div>
    );
}
