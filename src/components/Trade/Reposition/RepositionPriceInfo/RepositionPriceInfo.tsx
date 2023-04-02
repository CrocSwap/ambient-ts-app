// START: Import Local Files
import { capitalConcFactor, CrocEnv, tickToPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Dispatch, SetStateAction } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { getPinnedPriceValuesFromTicks } from '../../../../pages/Trade/Range/rangeFunctions';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
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
    isConfirmModal?: boolean;

    minPriceDisplay: string;
    maxPriceDisplay: string;

    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;

    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    rangeGasPriceinDollars: string | undefined;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    const {
        position,
        ambientApy,
        currentPoolPriceDisplay,
        currentPoolPriceTick,
        rangeWidthPercentage,

        isConfirmModal,
        minPriceDisplay,
        maxPriceDisplay,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        rangeGasPriceinDollars,
    } = props;

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;

    const isDenomBase = useAppSelector((state) => state.tradeData)?.isDenomBase;

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        position?.baseDecimals || 18,
        position?.quoteDecimals || 18,
        lowTick,
        highTick,
        lookupChain(position.chainId).gridSize,
    );

    const pinnedLowTick = pinnedDisplayPrices.pinnedLowTick;
    const pinnedHighTick = pinnedDisplayPrices.pinnedHighTick;

    const dispatch = useAppDispatch();

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';
    const poolPriceCharacter = isDenomBase
        ? quoteTokenCharacter
        : baseTokenCharacter;

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

    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APR of position

    const apr = <span className={styles.apr}>{aprPercentageString}</span>;

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
            <p className={styles.collateral_title}>
                Current {baseSymbol} Collateral
            </p>
            <p
                className={styles.collateral_amount}
                style={{ color: 'var(--text-grey-light)' }}
            >
                {currentBaseQtyDisplayTruncated}
            </p>
        </div>
    );
    const quoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>
                Current {quoteSymbol} Collateral
            </p>
            <p
                className={styles.collateral_amount}
                style={{ color: 'var(--text-grey-light)' }}
            >
                {currentQuoteQtyDisplayTruncated}
            </p>
        </div>
    );
    const newBaseTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>
                {baseSymbol} After Reposition
            </p>
            <p className={styles.collateral_amount}>{newBaseQtyDisplay}</p>
        </div>
    );
    const newQuoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>
                {quoteSymbol} After Reposition
            </p>
            <p className={styles.collateral_amount}>{newQuoteQtyDisplay}</p>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {!isConfirmModal ? apr : null}
            <div className={styles.price_info_content}>
                {minimumPrice}
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span
                        className={styles.current_price}
                        onClick={() => {
                            dispatch(toggleDidUserFlipDenom());
                        }}
                    >
                        {poolPriceCharacter}
                        {currentPoolPriceDisplay}
                    </span>
                </div>
                {maximumPrice}
            </div>
            <div className={styles.collateral_container}>
                {baseTokenCollateral}
                {newBaseTokenCollateral}
            </div>
            <div className={styles.collateral_container}>
                {quoteTokenCollateral}
                {newQuoteTokenCollateral}
            </div>
            <div className={styles.gas_pump}>
                <FaGasPump size={15} />
                {rangeGasPriceinDollars ? rangeGasPriceinDollars : '…'}
            </div>
        </div>
    );
}
