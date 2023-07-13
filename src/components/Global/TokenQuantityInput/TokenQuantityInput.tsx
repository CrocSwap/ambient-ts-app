import { ChangeEvent, memo, useEffect, useState } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import Spinner from '../Spinner/Spinner';
import styles from './TokenQuantityInput.module.css';

interface propsIF {
    value: string;
    disable?: boolean;
    disabledContent?: React.ReactNode;
    fieldId: string;
    onEventChange: (evt: ChangeEvent<HTMLInputElement>) => void;
    isAdvancedMode?: boolean;
    token: TokenIF;
    parseInput?: (value: string) => void;
    isLoading?: boolean;
}
function RangeCurrencyQuantity(props: propsIF) {
    const {
        isLoading,
        value,
        token,
        disable,
        disabledContent,
        onEventChange,
        fieldId,
        isAdvancedMode,
        parseInput,
    } = props;

    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const onBlur = (input: string) => {
        parseInput && parseInput(input);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(event.target.value) > token.decimals;
        if (!isPrecisionGreaterThanDecimals && !isNaN(+event.target.value)) {
            onEventChange(event);
            setDisplayValue(event.target.value);
        }
    };

    return (
        <div className={styles.token_quantity_input}>
            {isLoading ? (
                <div className={styles.circular_progress}>
                    <Spinner size={24} bg='var(--dark2)' weight={2} />
                </div>
            ) : (
                <>
                    {isAdvancedMode && disable && disabledContent}

                    <input
                        id={`${fieldId}-range-quantity`}
                        className={styles.input}
                        placeholder={isLoading ? '' : '0.0'}
                        onChange={(event) => onChange(event)}
                        onBlur={(event) => onBlur(event.target.value)}
                        value={isLoading ? '' : displayValue}
                        type='number'
                        step='any'
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                        disabled={disable}
                    />
                </>
            )}
        </div>
    );
}

export default memo(RangeCurrencyQuantity);
