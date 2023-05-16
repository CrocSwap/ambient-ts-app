import styles from './SelectedRange.module.css';
import { memo, useState } from 'react';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    minPriceDisplay: number | string;
    maxPriceDisplay: number | string;
    spotPriceDisplay?: string;
    poolPriceDisplayNum: number;
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
function SelectedRange(props: propsIF) {
    const {
        poolPriceDisplayNum,
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
        (isTokenABase && denominationsInBase) ||
        (!isTokenABase && !denominationsInBase);

    const [denomInBase, setDenomInBase] = useState(denominationsInBase);
    const [reverseDisplay, setReverseDisplay] = useState(reverseDisplayDefault);

    const minPrice = denomInBase
        ? pinnedMinPriceDisplayTruncatedInBase
        : pinnedMinPriceDisplayTruncatedInQuote;

    const maxPrice = denomInBase
        ? pinnedMaxPriceDisplayTruncatedInBase
        : pinnedMaxPriceDisplayTruncatedInQuote;

    const displayPriceWithDenom = denomInBase
        ? 1 / poolPriceDisplayNum
        : poolPriceDisplayNum;

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
                <div
                    className={styles.price_range_content}
                    onClick={() => {
                        setReverseDisplay(!reverseDisplay);
                        setDenomInBase(!denomInBase);
                    }}
                >
                    <p className={styles.price_range_title}>{title}</p>
                    <p className={styles.price_range_amount}>{value}</p>
                    <p className={styles.price_range_title}>{tokens}</p>
                    <p className={styles.price_range_info}>
                        Your position will be 100% {currentToken} at this price.
                    </p>
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
                    reverseDisplay
                        ? tokenPair.dataTokenA.symbol
                        : tokenPair.dataTokenB.symbol
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
                    reverseDisplay
                        ? tokenPair.dataTokenB.symbol
                        : tokenPair.dataTokenA.symbol
                }
            />
        </div>
    );

    const extraInfoData = (
        <div className={styles.extra_info_container}>
            <div className={styles.row}>
                <p>Current Price</p>
                <p
                    onClick={() => {
                        setReverseDisplay(!reverseDisplay);
                        setDenomInBase(!denomInBase);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {displayPriceString}
                </p>
            </div>
            <div className={styles.row}>
                <p>Current Fee Rate</p>
                <p>0.05%</p>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.selected_range}>
                {/* {switchButtons} */}
                {<div />}
                {!isAmbient ? selectedRangeDisplay : null}
                <div style={{ padding: '0 1rem' }}>{extraInfoData}</div>
            </div>
        </>
    );
}

export default memo(SelectedRange);
