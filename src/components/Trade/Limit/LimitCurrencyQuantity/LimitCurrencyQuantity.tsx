// import { ChangeEvent } from 'react';
import styles from './LimitCurrencyQuantity.module.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    parseInput: (val: string) => void;
    thisToken: TokenIF;
}

function LimitCurrencyQuantity(props: propsIF) {
    const {
        value,
        thisToken,
        disable,
        fieldId,
        handleChangeEvent,
        parseInput,
    } = props;

    const [displayValue, setDisplayValue] = useState<string>('');
    const [toggleInputUpdated, setToggleInputUpdated] = useState(false);

    useEffect(() => {
        setDisplayValue(value);
    }, [toggleInputUpdated, value]);

    const handleOnBlur = (input: string) => {
        parseInput(input);
        setToggleInputUpdated(!toggleInputUpdated);
    };

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value;
        setDisplayValue(input);
        handleChangeEvent(event);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(event.target.value) > thisToken.decimals;
        const isUserInputValid =
            !isPrecisionGreaterThanDecimals && !isNaN(+event.target.value);
        if (isUserInputValid && !isPrecisionGreaterThanDecimals) {
            handleEventLocal(event);
        }
    };

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-quantity`}
                className={styles.currency_quantity}
                aria-label={`Enter ${fieldId} amount`}
                placeholder='0.0'
                onChange={(event) => {
                    handleOnChange(event);
                }}
                onBlur={(e) => handleOnBlur(e.target.value)}
                value={displayValue}
                type='number'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                disabled={disable}
            />
        </div>
    );
}

export default LimitCurrencyQuantity;
