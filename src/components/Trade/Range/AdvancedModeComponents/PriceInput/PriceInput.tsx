import styles from './PriceInput.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ChangeEvent, KeyboardEvent } from 'react';

interface priceInputProps {
    disable?: boolean;
    fieldId: string | number;
    title: string;
    percentageDifference: number;
    value: number;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    // onFocus: () => void;
    onBlur: () => void;
    increaseTick: () => void;
    decreaseTick: () => void;
    isRangeCopied: boolean;
}

export default function PriceInput(props: priceInputProps) {
    const {
        disable,
        fieldId,
        title,
        percentageDifference,
        handleChangeEvent,
        onBlur,
        increaseTick,
        decreaseTick,
        isRangeCopied,
        // value
    } = props;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const allowedChars = /^(\d*\.?\d*|\d{0,3}(,\d{3})*(\.\d+)?)?$/;
        if (
            !allowedChars.test(e.key) &&
            e.key !== '.' &&
            e.key !== ',' &&
            e.key !== 'Backspace' &&
            e.key !== 'Tab'
        ) {
            e.preventDefault();
        }
    };

    const priceInput = (
        <input
            id={`${fieldId}-price-input-quantity`}
            className={styles.price_quantity}
            type='text'
            onChange={handleChangeEvent}
            onBlur={() => onBlur()}
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            // pattern='^\d{0,3}(,\d{3})*(\.\d+)?$'
            placeholder='0.0'
            disabled={disable}
            onKeyDown={handleKeyDown}
            // value={value}
            aria-label={`${fieldId} price input quantity.`}
        />
    );

    const percentageDifferenceString =
        percentageDifference >= 0
            ? '+' + percentageDifference
            : percentageDifference.toString();

    return (
        <div className={styles.minMax_container} id={`range_${fieldId}_price`}>
            {/* {disable && disabledContent} */}
            <span className={styles.title}>{title}</span>
            <div className={styles.price_input_container}>
                <button
                    className={styles.sign}
                    onClick={decreaseTick}
                    aria-label={`decrease tick of ${fieldId} price.`}
                >
                    <FaMinus size={16} />
                </button>
                <span className={isRangeCopied && styles.pulse_animation}>
                    {priceInput}
                </span>
                <button
                    className={styles.sign}
                    onClick={increaseTick}
                    aria-label={`increase tick of ${fieldId} price.`}
                >
                    <FaPlus size={16} />
                </button>
            </div>
            <span
                className={styles.percentage}
                tabIndex={0}
                aria-label={`Percentage difference is ${percentageDifferenceString} percent.`}
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            >
                {percentageDifferenceString}%
            </span>
        </div>
    );
}
