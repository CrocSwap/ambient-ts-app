import { ChangeEvent, memo, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './RangeCurrencyQuantity.module.css';
import { decimalNumRegEx } from '../../../../utils/regex/exports';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    value: string;
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isAdvancedMode: boolean;
    thisToken: TokenIF;
}
function RangeCurrencyQuantity(props: propsIF) {
    const {
        value,
        thisToken,
        disable,
        updateOtherQuantity,
        fieldId,
        isAdvancedMode,
    } = props;

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        updateOtherQuantity(event);
        const input = event.target.value.startsWith('.')
            ? '0' + event.target.value
            : event.target.value;
        setDisplayValue(input);
    };

    const disabledContent = (
        <div className={styles.overlay_container}>
            <div className={styles.disabled_text}>
                The market is outside your specified range.
                <div className={styles.warning_text}>
                    Single-asset deposit only.
                </div>
            </div>
        </div>
    );

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

    return (
        <div className={styles.token_amount}>
            {isAdvancedMode && disable && disabledContent}

            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    parseInput(event);
                }}
                value={displayValue}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern={decimalNumRegEx.source}
                disabled={disable}
            />
        </div>
    );
}

export default memo(RangeCurrencyQuantity);
