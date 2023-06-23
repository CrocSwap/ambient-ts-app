import { ChangeEvent, memo, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './RangeCurrencyQuantity.module.css';

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
            {isAdvancedMode && disable && disabledContent}

            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => {
                    handleOnChange(event);
                }}
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

export default memo(RangeCurrencyQuantity);
