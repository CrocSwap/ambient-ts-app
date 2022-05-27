import { ChangeEvent } from 'react';
import styles from './RangeCurrencyQuantity.module.css';

interface RangeCurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function RangeCurrencyQuantity(props: RangeCurrencyQuantityProps) {
    const { disable, updateOtherQuantity, fieldId } = props;

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(e) => updateOtherQuantity(e)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );
}
