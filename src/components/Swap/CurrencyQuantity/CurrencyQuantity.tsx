import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
import useDebounce from '../../../App/hooks/useDebounce';
import { TokenIF } from '../../../utils/interfaces/exports';
import styles from './CurrencyQuantity.module.css';
import Spinner from '../../Global/Spinner/Spinner';
import { decimalNumRegEx } from '../../../utils/regex/exports';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    thisToken: TokenIF;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
    setIsSellLoading: Dispatch<SetStateAction<boolean>>;
    setIsBuyLoading: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
}

function CurrencyQuantity(props: propsIF) {
    const {
        value,
        thisToken,
        disable,
        fieldId,
        handleChangeEvent,
        setSellQtyString,
        setBuyQtyString,
        setDisableReverseTokens,
        setIsBuyLoading,
        setIsSellLoading,
        isLoading,
    } = props;

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const [lastEvent, setLastEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    // Let input rest 3/4 of a second before triggering an update
    const debouncedLastEvent = useDebounce(lastEvent, 750);

    useEffect(() => {
        if (debouncedLastEvent) handleChangeEvent(debouncedLastEvent);
    }, [debouncedLastEvent]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (fieldId === 'sell') {
            setBuyQtyString('');
            if (value && parseFloat(value) !== 0) {
                setIsBuyLoading(true);
                setSellQtyString(value);
            }
            value || setIsBuyLoading(false);
        } else if (fieldId === 'buy') {
            setSellQtyString('');
            if (value && parseFloat(value) !== 0) {
                setIsSellLoading(true);
                setBuyQtyString(value);
            }
            value || setIsSellLoading(false);
        }

        setDisplayValue(value);
        setDisableReverseTokens(true);
        setLastEvent(event);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    // TODO: consolidate all the currency quantities/converters/selectors
    const parseInput = (event: ChangeEvent<HTMLInputElement>) => {
        let parsedInput = event.target.value.replaceAll(',', '');
        parsedInput = parsedInput.startsWith('.')
            ? '0' + parsedInput
            : parsedInput;
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(parsedInput) > thisToken.decimals;
        const isUserInputValid =
            !isPrecisionGreaterThanDecimals &&
            (event.target.value === '' || event.target.validity.valid);
        if (isUserInputValid) {
            // don't format 0, '', or numbers that end with .
            let formattedInput = parsedInput;
            if (parsedInput && !parsedInput.endsWith('.'))
                formattedInput = getFormattedNumber({
                    value: Number(parsedInput),
                    isInput: true,
                    minFracDigits: 0,
                    maxFracDigits: 20,
                    zeroDisplay: '0',
                });
            handleEventLocal({
                ...event,
                target: { ...event.target, value: formattedInput },
            });
        }
    };

    const ariaLive = fieldId === 'sell' ? 'polite' : 'off';

    const progressDisplay = (
        <div className={styles.circular_progress}>
            <Spinner size={24} bg='var(--dark2)' weight={2} />
        </div>
    );
    return (
        <div className={`${styles.token_amount} `}>
            {isLoading && progressDisplay}
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder={isLoading ? '' : '0.0'}
                tabIndex={0}
                aria-live={ariaLive}
                aria-label={`Enter ${fieldId} amount`}
                onChange={(event) => {
                    parseInput(event);
                }}
                value={isLoading ? '' : displayValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                maxLength={20}
                pattern={decimalNumRegEx.source}
                disabled={disable}
            />
        </div>
    );
}

export default memo(CurrencyQuantity);
