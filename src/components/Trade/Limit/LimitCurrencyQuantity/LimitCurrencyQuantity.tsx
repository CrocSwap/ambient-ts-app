// import { ChangeEvent } from 'react';
import styles from './LimitCurrencyQuantity.module.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';
import createOnChangeHandler from '../../../../utils/functions/createOnChangeHandler';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    thisToken: TokenIF;
}

export default function LimitCurrencyQuantity(props: propsIF) {
    const { value, thisToken, disable, fieldId, handleChangeEvent } = props;

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        handleChangeEvent(event);

        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;

        setDisplayValue(input);
    };

    const handleChange = createOnChangeHandler(handleEventLocal, {
        replaceCommas: true,
        regexPattern: /^(\d*\.?\d*|\d{0,3}(,\d{3})*(\.\d+)?)?$/,
        maxPrecision: thisToken.decimals,
    });

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-quantity`}
                className={styles.currency_quantity}
                aria-label={`Enter ${fieldId} amount`}
                placeholder='0.0'
                onChange={handleChange}
                value={displayValue}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.]?[0-9]*$'
                disabled={disable}
                autoFocus={fieldId === 'sell'}
            />
        </div>
    );
}
