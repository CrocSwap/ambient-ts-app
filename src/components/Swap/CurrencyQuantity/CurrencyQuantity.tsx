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
            setSellQtyString(event.target.value);
        } else if (event && fieldId === 'buy') {
            setSellQtyString('');
            setBuyQtyString(event.target.value);
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

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    const targetValue = event.target.value.replaceAll(',', '');
                    const isPrecisionGreaterThanDecimals =
                        precisionOfInput(targetValue) > thisToken.decimals;
                    const isValid =
                        !isPrecisionGreaterThanDecimals &&
                        (targetValue === '' || event.target.validity.valid);

                    if (isValid) {
                        handleEventLocal(event);
                    }
                }}
                value={displayValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9,]*[.]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );
}
