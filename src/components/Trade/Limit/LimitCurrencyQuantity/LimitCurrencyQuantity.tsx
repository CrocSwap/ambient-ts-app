// import { ChangeEvent } from 'react';
import styles from './LimitCurrencyQuantity.module.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';

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
        // console.log(`setting display value for ${fieldId} to: ${value}`);
        setDisplayValue(value);
    }, [value]);

    // console.log({ fieldId });
    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        // if (event && fieldId === 'sell') {
        //     setTokenBInputQty('');
        // } else if (event && fieldId === 'buy') {
        //     setTokenAInputQty('');
        // }

        handleChangeEvent(event);

        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;

        setDisplayValue(input);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        // String Does Not Contain Decimal
        return 0;
    };

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    const isPrecisionGreaterThanDecimals =
                        precisionOfInput(event.target.value) > thisToken.decimals;
                    const isValid =
                        !isPrecisionGreaterThanDecimals &&
                        (event.target.value === '' || event.target.validity.valid);
                    isValid ? handleEventLocal(event) : null;
                }}
                value={displayValue}
                type='string'
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
