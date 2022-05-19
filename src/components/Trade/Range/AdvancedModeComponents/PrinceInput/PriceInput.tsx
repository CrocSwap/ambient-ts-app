import styles from './PriceInput.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface priceInputProps {
    disable?: boolean;
    fieldId: boolean | number;
    title: string;
    percentageDifference: number;
}

export default function PriceInput(props: priceInputProps) {
    const { disable, fieldId, title, percentageDifference } = props;

    const priceInput = (
        <input
            id={`${fieldId}-price-input-quantity`}
            className={styles.price_quantity}
            type='text'
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

    return (
        <div className={styles.minMax_container}>
            <span className={styles.title}>{title}</span>
            <div className={styles.price_input_container}>
                <span className={styles.sign}>
                    <FaMinus size={19} />
                </span>
                <span>{priceInput}</span>
                <span className={styles.sign}>
                    <FaPlus size={19} />
                </span>
            </div>
            <span className={styles.percentage}>{percentageDifference}% difference</span>
        </div>
    );
}
