import styles from './SelectedRange.module.css';
import { useState } from 'react';

interface SelectedRangeProps {
    minPriceDisplay: number | string;
    maxPriceDisplay: number | string;
    spotPriceDisplay: number | string;
}
export default function SelectedRange(props: SelectedRangeProps) {
    const { minPriceDisplay, maxPriceDisplay, spotPriceDisplay } = props;
    const [reverseDisplay, setReverseDisplay] = useState(false);

    const tokenAShortName = 'ETH';
    const tokenBShortName = 'DAI';

    const switchButtons = (
        <div className={styles.button_container}>
            <button
                onClick={() => {
                    setReverseDisplay(!reverseDisplay);
                }}
                className={reverseDisplay ? styles.active_button : styles.non_active_button}
            >
                {tokenAShortName}
            </button>
            <button
                onClick={() => {
                    setReverseDisplay(!reverseDisplay);
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
                value={minPriceDisplay}
                tokens='DAI per ETH'
                currentToken='ETH'
            />
            <PriceRangeDisplay
                title='Max Price'
                value={maxPriceDisplay}
                tokens='DAI per ETH'
                currentToken='DAI'
            />
        </div>
    );

    const currentPriceDisplay = (
        <div className={styles.currentPrice_display}>
            <div className={styles.currentPrice_container}>
                <span className={styles.currentPrice_title}>Current price</span>
                <span className={styles.currentPrice_amount}>{spotPriceDisplay}</span>
                <span className={styles.currentPrice_info}> DAI per ETH</span>
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
                {selectedRangeDisplay}
                {currentPriceDisplay}
            </div>
        </>
    );
}
