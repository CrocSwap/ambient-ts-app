// START: Import Local Files
import { capitalConcFactor, CrocEnv, CrocReposition, tickToPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { formatDaysRange } from '../../../../App/functions/formatDaysRange';
import useDebounce from '../../../../App/hooks/useDebounce';
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
    crocEnv: CrocEnv | undefined;
    position: PositionIF;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    const {
        crocEnv,
        position,
        ambientApy,
        dailyVol,
        currentPoolPriceDisplay,
        currentPoolPriceTick,
        rangeWidthPercentage,
        setMaxPrice,
        setMinPrice,
    } = props;

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;
    const currentBaseQtyDisplay = position?.positionLiqBaseDecimalCorrected;
    const currentQuoteQtyDisplay = position?.positionLiqQuoteDecimalCorrected;

    const isDenomBase = useAppSelector((state) => state.tradeData)?.isDenomBase;

    function truncateString(qty?: number): string {
        return qty
            ? qty < 2
                ? qty.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : qty.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : '0.00';
    }

    const currentBaseQtyDisplayTruncated = truncateString(currentBaseQtyDisplay);

    const currentQuoteQtyDisplayTruncated = truncateString(currentQuoteQtyDisplay);

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
    const pinnedLowTick = pinnedDisplayPrices.pinnedLowTick;
    const pinnedHighTick = pinnedDisplayPrices.pinnedHighTick;

    // -----------------------------TEMPORARY PLACE HOLDERS--------------

    const [minPriceDisplay, setMinPriceDisplay] = useState<string>(
        pinnedMinPriceDisplayTruncated || '0.00',
    );
    const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>(
        pinnedMaxPriceDisplayTruncated || '0.00',
    );

    const [newBaseQtyDisplay, setNewBaseQtyDisplay] = useState<string>('0.00');
    const [newQuoteQtyDisplay, setNewQuoteQtyDisplay] = useState<string>('0.00');

    useEffect(() => {
        setMinPriceDisplay(pinnedMinPriceDisplayTruncated.toString());
        if (pinnedMinPriceDisplayTruncated !== undefined) {
            setMinPrice(parseFloat(pinnedMinPriceDisplayTruncated));
        }
    }, [pinnedMinPriceDisplayTruncated]);

    useEffect(() => {
        setMaxPriceDisplay(pinnedMaxPriceDisplayTruncated);
        setMaxPrice(parseFloat(pinnedMaxPriceDisplayTruncated));
    }, [pinnedMaxPriceDisplayTruncated]);

    useEffect(() => {
        if (!crocEnv) {
            return;
        }
        const pool = crocEnv.pool(position.base, position.quote);

        const repo = new CrocReposition(pool, {
            liquidity: position.positionLiq,
            burn: [position.bidTick, position.askTick],
            mint: [pinnedLowTick, pinnedHighTick],
        });

        repo.postBalance().then(([base, quote]: [number, number]) => {
            setNewBaseQtyDisplay(truncateString(base));
            setNewQuoteQtyDisplay(truncateString(quote));
        });
    }, [
        useDebounce(pinnedLowTick, 500), // Debounce beause effect involves on-chain call
        useDebounce(pinnedHighTick, 500),
        position.baseSymbol,
        position.quoteSymbol,
        currentPoolPriceTick,
        position.positionLiq,
        position.bidTick,
        position.askTick,
    ]);

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';
    const poolPriceCharacter = isDenomBase ? quoteTokenCharacter : baseTokenCharacter;

    let aprPercentage = ambientApy;

    if (ambientApy) {
        const concFactor = capitalConcFactor(
            tickToPrice(currentPoolPriceTick),
            tickToPrice(pinnedLowTick),
            tickToPrice(pinnedHighTick),
        );
        aprPercentage = ambientApy * concFactor;
    }

    const aprPercentageString = aprPercentage
        ? `Est. APR | ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';

    let daysInRange = 0;

    if (dailyVol) {
        const poolPrice = tickToPrice(currentPoolPriceTick);
        const lowPrice = tickToPrice(pinnedLowTick);
        const highPrice = tickToPrice(pinnedHighTick);

        const upperPercent = Math.log(highPrice / poolPrice);
        const lowerPercent = Math.log(poolPrice / lowPrice);

        if (upperPercent > 0 && lowerPercent > 0) {
            const daysBelow = Math.pow(upperPercent / dailyVol, 2);
            const daysAbove = Math.pow(lowerPercent / dailyVol, 2);
            daysInRange = Math.min(daysBelow, daysAbove);
        }
    }

    const daysInRangeString = daysInRange ? `Time in Range | ${formatDaysRange(daysInRange)}` : '…';

    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APR of position

    const apr = <span className={styles.apr}>{aprPercentageString}</span>;
    const days = <span className={styles.apr}>{daysInRangeString}</span>;

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
            <p className={styles.collateral_amount}>{newBaseQtyDisplay}</p>
        </div>
    );
    const newQuoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>{quoteSymbol} After Reposition</p>
            <p className={styles.collateral_amount}>{newQuoteQtyDisplay}</p>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apr}
            {days}
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
