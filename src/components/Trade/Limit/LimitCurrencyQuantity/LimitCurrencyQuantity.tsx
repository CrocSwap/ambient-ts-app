// import { ChangeEvent } from 'react';
import styles from './LimitCurrencyQuantity.module.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';
import { exponentialNumRegEx } from '../../../../utils/regex/exports';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    thisToken: TokenIF;
}

function LimitCurrencyQuantity(props: propsIF) {
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

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-quantity`}
                className={styles.currency_quantity}
                aria-label={`Enter ${fieldId} amount`}
                placeholder='0.0'
                onChange={(event) => {
                    const isPrecisionGreaterThanDecimals =
                        precisionOfInput(event.target.value) >
                        thisToken.decimals;
                    const isValid =
                        !isPrecisionGreaterThanDecimals &&
                        (event.target.value === '' ||
                            event.target.validity.valid);
                    isValid ? handleEventLocal(event) : null;
                }}
                onBlur={() =>
                    setDisplayValue(parseFloat(displayValue).toString())
                }
                value={displayValue}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern={exponentialNumRegEx.source}
                disabled={disable}
            />
        </div>
    );
}

export default LimitCurrencyQuantity;
