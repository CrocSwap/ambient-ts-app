import { ChangeEvent, useEffect, useState } from 'react';
import styles from './RangeCurrencyQuantity.module.css';
// import { GoCircleSlash } from 'react-icons/go';

interface RangeCurrencyQuantityProps {
    value: string;
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isAdvancedMode: boolean;
}
export default function RangeCurrencyQuantity(props: RangeCurrencyQuantityProps) {
    const { value, disable, updateOtherQuantity, fieldId, isAdvancedMode } = props;
    // console.log({ disable });

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        updateOtherQuantity(event);

        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;

        setDisplayValue(input);
    };

    const disabledContent = (
        <div className={styles.overlay_container}>
            {/* <GoCircleSlash size={15} /> */}
            <div className={styles.disabled_text}>
                The market is outside your specified range.
                <div className={styles.warning_text}>Single-asset deposit only.</div>
            </div>
        </div>
    );

    return (
        <div className={styles.token_amount}>
            {isAdvancedMode && disable && disabledContent}

            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    const isValid = event.target.value === '' || event.target.validity.valid;
                    isValid ? handleEventLocal(event) : null;
                }}
                value={displayValue}
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
