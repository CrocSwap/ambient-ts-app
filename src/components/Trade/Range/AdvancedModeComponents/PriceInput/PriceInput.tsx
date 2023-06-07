import styles from './PriceInput.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ChangeEvent, FocusEventHandler, memo, useContext } from 'react';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { exponentialNumRegEx } from '../../../../../utils/regex/exports';

interface priceInputProps {
    disable?: boolean;
    fieldId: string | number;
    title: string;
    percentageDifference: number;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    onBlur: FocusEventHandler<HTMLInputElement>;
    increaseTick: () => void;
    decreaseTick: () => void;
}

function PriceInput(props: priceInputProps) {
    const {
        disable,
        fieldId,
        title,
        percentageDifference,
        handleChangeEvent,
        onBlur,
        increaseTick,
        decreaseTick,
    } = props;
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const percentageDifferenceString =
        percentageDifference >= 0
            ? '+' + percentageDifference
            : percentageDifference.toString();

    return (
        <div className={styles.minMax_container} id={`range_${fieldId}_price`}>
            <span className={styles.title}>{title}</span>
            <div className={styles.price_input_container}>
                <button
                    className={styles.sign}
                    onClick={decreaseTick}
                    aria-label={`decrease tick of ${fieldId} price.`}
                >
                    <FaMinus size={16} />
                </button>
                <span
                    className={
                        showRangePulseAnimation && styles.pulse_animation
                    }
                >
                    <input
                        id={`${fieldId}-price-input-quantity`}
                        className={styles.price_quantity}
                        type='text'
                        onChange={(event) => handleChangeEvent(event)}
                        onBlur={onBlur}
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                        pattern={exponentialNumRegEx.source}
                        placeholder='0.0'
                        disabled={disable}
                        aria-label={`${fieldId} price input quantity.`}
                    />
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

export default memo(PriceInput);
