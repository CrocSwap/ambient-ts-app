import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
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

    const [displayValue, setDisplayValue] = useState<string>('');

    const [lastEvent, setLastEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    useEffect(() => {
        const valueWithLeadingZero = value.startsWith('.')
            ? '0' + value
            : value;
        setDisplayValue(valueWithLeadingZero);
    }, [value]);

    const debouncedLastEvent = useDebounce(lastEvent, 750); // debounce 3/4 second

    useEffect(() => {
        if (debouncedLastEvent) handleChangeEvent(debouncedLastEvent);
    }, [debouncedLastEvent]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        if (event && fieldId === 'sell') {
            setBuyQtyString('');
            const valueWithLeadingZero = event.target.value.startsWith('.')
                ? '0' + event.target.value
                : event.target.value;
            setSellQtyString(valueWithLeadingZero);
        } else if (event && fieldId === 'buy') {
            setSellQtyString('');
            const valueWithLeadingZero = event.target.value.startsWith('.')
                ? '0' + event.target.value
                : event.target.value;
            setBuyQtyString(valueWithLeadingZero);
        }

        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;

        setDisplayValue(input);

        setDisableReverseTokens(true);
        setLastEvent(event);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        // String Does Not Contain Decimal
        return 0;
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        let targetValue = event.target.value.replaceAll(',', '');

        if (targetValue.includes(',')) {
            const commaIndex = targetValue.lastIndexOf(',');
            targetValue =
                targetValue.slice(0, commaIndex) +
                targetValue.slice(commaIndex).replace(',', '');
        }

        const isPrecisionGreaterThanDecimals =
            precisionOfInput(targetValue) > thisToken.decimals;
        const isValid =
            !isPrecisionGreaterThanDecimals &&
            (targetValue === '' || event.target.validity.valid);

        if (isValid) {
            handleEventLocal(event);
        }
    };

    const ariaLive = fieldId === 'sell' ? 'polite' : 'off';
    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                autoFocus={fieldId === 'sell'}
                className={styles.currency_quantity}
                placeholder='0.0'
                tabIndex={0}
                aria-live={ariaLive}
                aria-label={`Enter ${fieldId} amount`}
                onChange={(event) => {
                    handleOnChange(event);
                }}
                value={displayValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*(,[0-9]*)?[.]?[0-9]*$'
                disabled={disable}
            />
        </div>
    );
}
