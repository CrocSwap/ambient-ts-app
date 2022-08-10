import styles from './SelectedRange.module.css';
import { useState } from 'react';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';

interface SelectedRangeProps {
    minPriceDisplay: number | string;
    maxPriceDisplay: number | string;
    spotPriceDisplay: string;
    denominationsInBase: boolean;
    isTokenABase: boolean;
    tokenPair: TokenPairIF;
    isAmbient: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    // poolPriceTruncatedInBase: string;
    // poolPriceTruncatedInQuote: string;
}
export default function SelectedRange(props: SelectedRangeProps) {
    const {
        // minPriceDisplay,
        // maxPriceDisplay,
        spotPriceDisplay,
        denominationsInBase,
        isTokenABase,
        tokenPair,
        isAmbient,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
    } = props;

    const reverseDisplayDefault =
        (isTokenABase && denominationsInBase) || (!isTokenABase && !denominationsInBase);

    const [denomInBase, setDenomInBase] = useState(denominationsInBase);
    const [reverseDisplay, setReverseDisplay] = useState(reverseDisplayDefault);

    const minPrice = denomInBase
        ? pinnedMinPriceDisplayTruncatedInBase
        : pinnedMinPriceDisplayTruncatedInQuote;

    const maxPrice = denomInBase
        ? pinnedMaxPriceDisplayTruncatedInBase
        : pinnedMaxPriceDisplayTruncatedInQuote;

    const tokenAShortName = tokenPair.dataTokenA.symbol;
    const tokenBShortName = tokenPair.dataTokenB.symbol;

    const switchButtons = (
        <div className={styles.button_container}>
            <button
                onClick={() => {
                    // null;
                    setReverseDisplay(!reverseDisplay);
                    setDenomInBase(!denomInBase);
                }}
                className={reverseDisplay ? styles.active_button : styles.non_active_button}
            >
                {tokenAShortName}
            </button>
            <button
                onClick={() => {
                    // null;
                    setReverseDisplay(!reverseDisplay);
                    setDenomInBase(!denomInBase);
                }}
                className={reverseDisplay ? styles.non_active_button : styles.active_button}
            >
                {tokenBShortName}
            </button>
        </div>
    );

    // PRICE RANGE DISPLAY
    interface PriceRangeProps {
        title: string;
        value: number | string;
        tokens: string;
        currentToken: string;
    }
    const PriceRangeDisplay = (props: PriceRangeProps) => {
        const { title, value, tokens, currentToken } = props;
        return (
            <div className={styles.price_range_container}>
                <div className={styles.price_range_content}>
                    <span className={styles.price_range_title}>{title}</span>
                    <span className={styles.price_range_amount}>{value}</span>
                    <span className={styles.price_range_title}>{tokens}</span>
                    <span className={styles.price_range_info}>
                        Your position will be 100% composed of {currentToken} at this price.
                    </span>
                </div>
            </div>
        );
    };

    const selectedRangeDisplay = (
        <div className={styles.selected_range_display}>
            <PriceRangeDisplay
                title='Min Price'
                value={minPrice}
                tokens={
                    reverseDisplay
                        ? `${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`
                        : `${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                }
                currentToken={
                    reverseDisplay ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol
                }
            />
            <PriceRangeDisplay
                title='Max Price'
                value={maxPrice}
                tokens={
                    reverseDisplay
                        ? `${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`
                        : `${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`
                }
                currentToken={
                    reverseDisplay ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol
                }
            />
        </div>
    );

    const currentPriceDisplay = (
        <div className={styles.currentPrice_display}>
            <div className={styles.currentPrice_container}>
                <span className={styles.currentPrice_title}>Current price</span>
                <span className={styles.currentPrice_amount}>
                    {spotPriceDisplay}
                    {/* {denomInBase ? 1 / parseFloat(spotPriceDisplay) : spotPriceDisplay} */}
                </span>
                <span className={styles.currentPrice_info}>
                    {reverseDisplay
                        ? `${tokenPair.dataTokenB.symbol} per ${tokenPair.dataTokenA.symbol}`
                        : `${tokenPair.dataTokenA.symbol} per ${tokenPair.dataTokenB.symbol}`}
                </span>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.selected_range}>
                <div className={styles.selected_range_button_container}>
                    <div>Selected Range</div>
                    {switchButtons}
                </div>
                {!isAmbient ? selectedRangeDisplay : null}
                {currentPriceDisplay}
            </div>
        </>
    );
}
