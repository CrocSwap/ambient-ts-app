import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import styles from './CreateInput.module.css';
import { AuctionsContext } from '../../../contexts';

interface CreateInputProps {
    tickerInput: string;
    handleChange: (value: string) => void;
    isValidated: boolean;
    isValidationInProgress: boolean;
}
const TICKER_INPUT_ID = 'ticker_input';
const TICKER_MAX_LENGTH = 10;

const CreateInput: React.FC<CreateInputProps> = ({
    tickerInput = '',
    handleChange,
    isValidated,
    isValidationInProgress,
}) => {
    const { globalAuctionList } = useContext(AuctionsContext);
    const [displayValue, setDisplayValue] = useState<string>('');
    const [overflowValue, setOverflowValue] = useState<string>('');

    useEffect(() => {
        const inputValue = String(tickerInput || '');
        if (inputValue.length > TICKER_MAX_LENGTH) {
            setDisplayValue(inputValue.slice(0, TICKER_MAX_LENGTH));
            setOverflowValue(inputValue.slice(TICKER_MAX_LENGTH));
        } else {
            setDisplayValue(inputValue);
            setOverflowValue('');
        }
    }, [tickerInput, TICKER_MAX_LENGTH]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        handleChange(e.target.value);
    };

    useEffect(() => {
        const input = document.getElementById(
            TICKER_INPUT_ID,
        ) as HTMLInputElement;
        if (input) input.focus();
    }, []);

    function generateValidSuggestion(ticker: string): string {
        // Remove special characters and spaces
        let suggestion = ticker.replace(/[^A-Z0-9]/g, '');

        // Ensure it starts with a letter if it doesn't
        if (/^[0-9]/.test(suggestion)) {
            suggestion = 'T' + suggestion;
        }

        // Truncate to leave room for potential number suffix (max 8 chars instead of 10)
        if (suggestion.length > 8) {
            suggestion = suggestion.slice(0, 8);
        }

        // If empty or too short, pad with default chars
        if (suggestion.length < 3) {
            suggestion = suggestion.padEnd(3, 'X');
        }

        // Check if suggestion exists and add number suffix if needed
        let finalSuggestion = suggestion;
        let counter = 1;

        while (
            globalAuctionList.data?.some(
                (item) => item.ticker === finalSuggestion,
            )
        ) {
            finalSuggestion = `${suggestion}${counter}`;
            counter++;
        }

        return finalSuggestion;
    }

    return (
        <div className={styles.create_token_middle}>
            <div className={styles.ticker_input_fields}>
                <label htmlFor={TICKER_INPUT_ID}>
                    <h4>Token Ticker</h4>
                </label>
                <div
                    className={`${styles.inputContainer} ${
                        tickerInput.length > TICKER_MAX_LENGTH
                            ? styles.errorInput
                            : ''
                    }`}
                >
                    <div className={styles.inputWrapper}>
                        <input
                            name={TICKER_INPUT_ID}
                            id={TICKER_INPUT_ID}
                            value={tickerInput}
                            type='text'
                            onChange={handleInputChange}
                            autoCorrect='off'
                            spellCheck={false}
                            autoComplete='off'
                            className={styles.hiddenInput}
                        />
                        <div className={styles.textOverlay}>
                            <span className={styles.normalText}>
                                {displayValue}
                            </span>
                            <span className={styles.overflowText}>
                                {overflowValue}
                            </span>
                        </div>
                    </div>

                    <p
                        className={
                            tickerInput.length > TICKER_MAX_LENGTH
                                ? styles.errorText
                                : ''
                        }
                    >
                        {TICKER_MAX_LENGTH - tickerInput.length}
                    </p>
                </div>
            </div>
            {!isValidated && tickerInput && !isValidationInProgress && (
                <div className={styles.suggestionContainer}>
                    <span className={styles.suggestionText}>
                        Consider using:{' '}
                    </span>
                    <button
                        onClick={() =>
                            handleChange(generateValidSuggestion(tickerInput))
                        }
                        className={styles.suggestionButton}
                    >
                        {generateValidSuggestion(tickerInput)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateInput;
