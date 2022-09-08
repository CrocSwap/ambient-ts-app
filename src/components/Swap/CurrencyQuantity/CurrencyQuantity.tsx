import { ChangeEvent, useEffect, useState } from 'react';
import useDebounce from '../../../App/hooks/useDebounce';
import styles from './CurrencyQuantity.module.css';

interface CurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function CurrencyQuantity(props: CurrencyQuantityProps) {
    const { disable, fieldId, handleChangeEvent } = props;

    const [newChangeEvent, setNewChangeEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    const debouncedEvent = useDebounce(newChangeEvent, 250); // debounce 1/4 second

    useEffect(() => {
        handleChangeEvent(debouncedEvent);
    }, [debouncedEvent]);

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => setNewChangeEvent(event)}
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
