import { ChangeEvent } from 'react';
import styles from './CurrencyQuantity.module.css';

interface CurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function CurrencyQuantity(props: CurrencyQuantityProps) {
    const { disable, fieldId, updateOtherQuantity } = props;

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => updateOtherQuantity(event)}
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
