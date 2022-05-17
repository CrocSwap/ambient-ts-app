import { ChangeEvent } from 'react';
import styles from './RangeCurrencyQuantity.module.css';

interface LiquidityCurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LiquidityCurrencyQuantity(props: LiquidityCurrencyQuantityProps) {
    const { disable, fieldId, updateOtherQuantity } = props;

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-liquidity-quantity`}
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
