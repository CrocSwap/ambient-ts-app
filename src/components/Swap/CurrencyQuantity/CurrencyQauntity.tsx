import styles from 'Row.module.css';

interface CurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
}

export default function CurrencyQuantity(props: CurrencyQuantityProps) {
    const { disable, fieldId } = props;

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
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
        </div>
    );
}
