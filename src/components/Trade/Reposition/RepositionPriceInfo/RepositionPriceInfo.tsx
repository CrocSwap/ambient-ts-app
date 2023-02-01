// START: Import Local Files
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useEffect, useState } from 'react';
import { getPinnedPriceValuesFromTicks } from '../../../../pages/Trade/Range/rangeFunctions';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import styles from './RepositionPriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
// import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
// interface IRepositionPriceInfoPropsIF {
//     tokenPair: TokenPairIF;
//     spotPriceDisplay: string;
//     maxPriceDisplay: string;
//     minPriceDisplay: string;
//     aprPercentage: number;
//     didUserFlipDenom: boolean;
//     poolPriceCharacter: string;
// }

interface IRepositionPriceInfoProps {
    position: PositionIF | undefined;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    const { position, currentPoolPriceDisplay, currentPoolPriceTick, rangeWidthPercentage } = props;

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;
    const currentBaseQtyDisplay = position?.positionLiqBaseDecimalCorrected;
    const currentQuoteQtyDisplay = position?.positionLiqQuoteDecimalCorrected;

    const isDenomBase = useAppSelector((state) => state.tradeData)?.isDenomBase;

    const currentBaseQtyDisplayTruncated = currentBaseQtyDisplay
        ? currentBaseQtyDisplay < 2
            ? currentBaseQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentBaseQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const currentQuoteQtyDisplayTruncated = currentQuoteQtyDisplay
        ? currentQuoteQtyDisplay < 2
            ? currentQuoteQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentQuoteQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const newBaseQtyDisplayTruncated = currentBaseQtyDisplayTruncated;
    const newQuoteQtyDisplayTruncated = currentQuoteQtyDisplayTruncated;

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        position?.baseDecimals || 18,
        position?.quoteDecimals || 18,
        lowTick,
        highTick,
        lookupChain(position?.chainId || '0x5').gridSize,
    );

    const pinnedMinPriceDisplayTruncated = pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
    const pinnedMaxPriceDisplayTruncated = pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;

    // -----------------------------TEMPORARY PLACE HOLDERS--------------
    const aprPercentage = 10;

    const [minPriceDisplay, setMinPriceDisplay] = useState<string>(
        pinnedMinPriceDisplayTruncated || '0.00',
    );
    const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(
        pinnedMaxPriceDisplayTruncated || '0.00',
    );

    useEffect(() => {
        setMinPriceDisplay(pinnedMinPriceDisplayTruncated.toString());
    }, [pinnedMinPriceDisplayTruncated]);

    useEffect(() => {
        setMaxPriceDisplay(pinnedMaxPriceDisplayTruncated);
    }, [pinnedMaxPriceDisplayTruncated]);

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';
    const poolPriceCharacter = isDenomBase ? quoteTokenCharacter : baseTokenCharacter;
    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APR of position

    const apr = <span className={styles.apr}> Est. APR | {aprPercentage}%</span>;

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span className={styles.min_price}>
                {rangeWidthPercentage === 100 ? '0' : minPriceDisplay}
                {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    // const currentPrice = makeCurrentPrice(parseFloat(spotPriceDisplay), didUserFlipDenom);
    // const currentPrice = spotPriceDisplay;

    // JSX frag for highest price in range
    const maximumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Max Price</h4>
            <span className={styles.max_price}>
                {rangeWidthPercentage === 100 ? '∞' : maxPriceDisplay}
            </span>
        </div>
    );

    // jsx for  Collateral
    const baseTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>Current {baseSymbol} Collateral</p>
            <p className={styles.collateral_amount}>{currentBaseQtyDisplayTruncated}</p>
        </div>
    );
    const quoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>Current {quoteSymbol} Collateral</p>
            <p className={styles.collateral_amount}>{currentQuoteQtyDisplayTruncated}</p>
        </div>
    );
    const newBaseTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>{baseSymbol} After Reposition</p>
            <p className={styles.collateral_amount}>{newBaseQtyDisplayTruncated}</p>
        </div>
    );
    const newQuoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>{quoteSymbol} After Reposition</p>
            <p className={styles.collateral_amount}>{newQuoteQtyDisplayTruncated}</p>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apr}
            <div className={styles.price_info_content}>
                {minimumPrice}
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span className={styles.current_price}>
                        {poolPriceCharacter}
                        {currentPoolPriceDisplay}
                    </span>
                </div>
                {maximumPrice}
            </div>
            <div className={styles.collateral_container}>
                {baseTokenCollateral}
                {quoteTokenCollateral}
            </div>
            <div className={styles.collateral_container}>
                {newBaseTokenCollateral}
                {newQuoteTokenCollateral}
            </div>
        </div>
    );
}
