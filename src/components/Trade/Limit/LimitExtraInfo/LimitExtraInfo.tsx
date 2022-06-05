// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './LimitExtraInfo.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';

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

    const limitExtraInfoDetails = (
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
