import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import useDebounce from '../../../App/hooks/useDebounce';
import styles from './CurrencyQuantity.module.css';

interface CurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
}

export default function CurrencyQuantity(props: CurrencyQuantityProps) {
    const { value, disable, fieldId, handleChangeEvent, setSellQtyString, setBuyQtyString } = props;

    const [newChangeEvent, setNewChangeEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const debouncedEvent = useDebounce(newChangeEvent, 500); // debounce 1/4 second

    useEffect(() => {
        if (debouncedEvent) {
            handleChangeEvent(debouncedEvent);
        }
    }, [debouncedEvent]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        if (event && fieldId === 'sell') {
            setBuyQtyString('');
        } else if (event && fieldId === 'buy') {
            setSellQtyString('');
        }

        setNewChangeEvent(event);

        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;

        setDisplayValue(input);
    };

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    const isValid = event.target.value === '' || event.target.validity.valid;
                    isValid ? handleEventLocal(event) : null;
                }}
                value={displayValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );
}
