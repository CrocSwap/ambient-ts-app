// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import truncateDecimals from '../../../../utils/data/truncateDecimals';
import makePriceDisplay from './makePriceDisplay';

// interface for component props
interface LimitExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy?: boolean;
    gasPriceinGwei: string;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    limitRate: string;
}

// central react functional component
export default function LimitExtraInfo(props: LimitExtraInfoPropsIF) {
    const {
        tokenPair,
        gasPriceinGwei,
        // quoteTokenIsBuy,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        didUserFlipDenom,
        isTokenABase,
        isDenomBase,
        limitRate,
    } = props;
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    // TEMP DATA TO RENDER UI
    // const spotPriceDisplayQuoteForBase = truncateDecimals(1 / poolPriceDisplay, 4);

    const reverseDisplay = (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const limitRateNum = truncateDecimals(parseFloat(limitRate), 4);

    const displayPriceString = isDenomBase
        ? truncateDecimals(1 / poolPriceDisplay, 4).toString()
        : truncateDecimals(poolPriceDisplay, 4).toString();

    // console.log({ limitRateNum });
    // const limitPriceString = isDenomBase
    //     ? truncateDecimals(1 / limitRateNum, 4).toString()
    //     : truncateDecimals(limitRateNum, 4).toString();

    const priceLimitAfterSlippageAndFee = isDenomBase
        ? truncateDecimals(
              limitRateNum * (1 - slippageTolerance / 100) * (1 - liquidityProviderFee / 100),
              4,
          )
        : truncateDecimals(
              limitRateNum * (1 + slippageTolerance / 100) * (1 + liquidityProviderFee / 100),
              4,
          );

    const truncatedGasInGwei = truncateDecimals(parseFloat(gasPriceinGwei), 2);

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${displayPriceString} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${displayPriceString} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Limit Price',
            tooltipTitle: 'limit price explanation',
            data: reverseDisplay
                ? `${limitRateNum} ${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                : `${limitRateNum} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
        },
        {
            title: 'Limit Price after Slippage',
            tooltipTitle: 'price limit explanation',
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

    const limitExtraInfoDetails = (
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

    const extraDetailsOrNull = showExtraDetails ? limitExtraInfoDetails : null;

    const priceDisplay = makePriceDisplay(
        tokenPair.dataTokenA,
        tokenPair.dataTokenB,
        isTokenABase,
        poolPriceDisplay,
        didUserFlipDenom,
    );

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
