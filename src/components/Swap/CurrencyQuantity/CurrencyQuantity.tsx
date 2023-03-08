import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import useDebounce from '../../../App/hooks/useDebounce';
import { TokenIF } from '../../../utils/interfaces/exports';
import styles from './CurrencyQuantity.module.css';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    thisToken: TokenIF;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
}

export default function CurrencyQuantity(props: propsIF) {
    const {
        value,
        thisToken,
        disable,
        fieldId,
        handleChangeEvent,
        setSellQtyString,
        setBuyQtyString,
        setDisableReverseTokens,
    } = props;

    const [newChangeEvent, setNewChangeEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const debouncedEvent = useDebounce(newChangeEvent, 500); // debounce 1/2 second

    useEffect(() => {
        if (debouncedEvent) {
            handleChangeEvent(debouncedEvent);
        }
    }, [debouncedEvent]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        if (event && fieldId === 'sell') {
            if (event.target.value === '') {
                setBuyQtyString('');
            } else {
                setBuyQtyString('');
            }
        } else if (event && fieldId === 'buy') {
            if (event.target.value === '') {
                setSellQtyString('');
            } else {
                setSellQtyString('');
            }
        }

        setDisableReverseTokens(true);
        setNewChangeEvent(event);

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
                id={`${fieldId}-quantity`}
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
