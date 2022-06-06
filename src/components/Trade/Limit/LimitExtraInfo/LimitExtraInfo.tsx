// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
// interface for component props
interface LimitExtraInfoPropsIF {
    tokenPair: TokenPairIF;
    poolPriceDisplay?: number;
    slippageTolerance?: number;
    liquidityProviderFee?: number;
    quoteTokenIsBuy?: boolean;
    gasPriceinGwei?: string;
}

// central react functional component
export default function LimitExtraInfo(props: LimitExtraInfoPropsIF) {
    const { tokenPair } = props;
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    // TEMP DATA TO RENDER UI
    const spotPriceDisplayQuoteForBase = 1310.7276;
    const priceLimitAfterSlippageAndFee = 1241.4556;
    const slippageTolerance = 5;
    const liquidityProviderFee = 0.3;
    const truncatedGasInGwei = 2.5;

    const extraInfoData = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: `${spotPriceDisplayQuoteForBase} ${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`,
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

    const limitExtraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extra_row} key={idx}>
                    <div className={styles.align_center}>
                        <span>{item.title}</span>
                        <TooltipComponent title={item.title} />
                    </div>
                    <span>{item.data}</span>
                </div>
            ))}
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? limitExtraInfoDetails : null;

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
            {extraDetailsOrNull}
        </div>
    );
}
