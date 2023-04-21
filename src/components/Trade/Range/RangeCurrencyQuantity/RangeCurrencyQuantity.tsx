import { ChangeEvent, useEffect, useState } from 'react';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './RangeCurrencyQuantity.module.css';
import createOnChangeHandler from '../../../../utils/functions/createOnChangeHandler';
// import { GoCircleSlash } from 'react-icons/go';

interface propsIF {
    value: string;
    disable?: boolean;
    fieldId: string;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isAdvancedMode: boolean;
    thisToken: TokenIF;
}
export default function RangeCurrencyQuantity(props: propsIF) {
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
            {/* <GoCircleSlash size={15} /> */}
            <div className={styles.disabled_text}>
                The market is outside your specified range.
                <div className={styles.warning_text}>
                    Single-asset deposit only.
                </div>
            </div>
        </div>
    );

    const handleChange = createOnChangeHandler(handleEventLocal, {
        replaceCommas: true,
        regexPattern: /^(\d*\.?\d*|\d{0,3}(,\d{3})*(\.\d+)?)?$/,
        maxPrecision: thisToken.decimals,
    });
    return (
        <div className={styles.token_amount}>
            {isAdvancedMode && disable && disabledContent}

            <input
                id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
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
                autoFocus={fieldId === 'A'}
            />
        </div>
    );
}
