import styles from './PriceInput.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ChangeEvent } from 'react';
import { GoCircleSlash } from 'react-icons/go';

interface priceInputProps {
    disable?: boolean;
    fieldId: string | number;
    title: string;
    percentageDifference: number;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function PriceInput(props: priceInputProps) {
    const { disable, fieldId, title, percentageDifference, handleChangeEvent } = props;

    const priceInput = (
        <input
            id={`${fieldId}-price-input-quantity`}
            className={styles.price_quantity}
            type='text'
            onChange={(event) => handleChangeEvent(event)}
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            pattern='^[0-9]*[.,]?[0-9]*$'
            placeholder='0.0'
            disabled={disable}
            required
        />
    );

    const disabledContent = (
        <div className={styles.overlay_container}>
            <GoCircleSlash size={15} />
            <div className={styles.disabled_text}>
                The market is outside your specified range.
                <span className={styles.warning_text}>Single-asset deposit only.</span>
            </div>
        </div>
    );

    return (
        <div className={styles.minMax_container}>
            {disable && disabledContent}
            <span className={styles.title}>{title}</span>
            <div className={styles.price_input_container}>
                <span className={styles.sign}>
                    <FaMinus size={16} />
                </span>
                <span>{priceInput}</span>
                <span className={styles.sign}>
                    <FaPlus size={16} />
                </span>
            </div>
            <span className={styles.percentage}>{percentageDifference}% difference</span>
        </div>
    );
}
