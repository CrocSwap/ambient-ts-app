import styles from './EditPriceInput.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ChangeEvent } from 'react';

interface EditPriceInputProps {
    disable?: boolean;
    fieldId: string | number;
    title: string;
    percentageDifference: number;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    increaseTick: () => void;
    decreaseTick: () => void;
}

export default function EditPriceInput(props: EditPriceInputProps) {
    const {
        disable,
        fieldId,
        title,
        percentageDifference,
        value,
        onBlur,
        increaseTick,
        decreaseTick,
        handleChangeEvent,
    } = props;

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
            value={value}
        />
    );

    return (
        <div className={styles.minMax_container}>
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
