import { useContext, useEffect, useState } from 'react';
import styles from './Create.module.css';
import useDebounce from '../../../App/hooks/useDebounce';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';

export default function Create() {
    const [ticker, setTicker] = useState<string>('');

    const { isUserConnected } = useContext(UserDataContext);

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);
    const [isValidated, setIsValidated] = useState<boolean>(false);

    function handleChange(text: string) {
        setIsValidationInProgress(true);
        setTicker(text);
    }

    const excludedTickers = ['ambi', 'amb', 'futa', 'nft', 'eth', 'btc'];

    // Regular expression pattern for Latin alphabet characters (both uppercase and lowercase), digits, and emoji
    const pattern = /^[A-Za-z0-9\p{Extended_Pictographic}]+$/u;
    /* 
        Example usage of the pattern
        console.log(isValidString("Hello123")); // true (Latin alphanumeric)
        console.log(isValidString("Hello😊123")); // true (Latin alphanumeric + Extended Pictographic)
        console.log(isValidString("こんにちは")); // false (Non-Latin characters)
        console.log(isValidString("1234😊😊")); // true (Digits + Extended Pictographic)
        console.log(isValidString("Hello!")); // false (Special character '!')
    */

    const checkTickerValidity = async (ticker: string) => {
        const lengthIsValid = ticker.length > 0 && ticker.length <= 10;
        const isPatternValid = pattern.test(ticker);
        // check if the ticker is in the excluded list
        const isExcluded = excludedTickers.includes(ticker.toLowerCase());
        return !isExcluded && isPatternValid && lengthIsValid;
    };

    const debouncedTickerInput = useDebounce(ticker, 500);

    useEffect(() => {
        checkTickerValidity(debouncedTickerInput).then((isValid) => {
            setIsValidationInProgress(false);
            setIsValidated(isValid);
        });
    }, [debouncedTickerInput]);

    // name for the ticker input field, keeps `<input/>` and `<label/>` sync'd
    const TICKER_INPUT_ID = 'ticker_input';
    const TICKER_MAX_LENGTH = 10;

    useEffect(() => {
        const input = document.getElementById(
            TICKER_INPUT_ID,
        ) as HTMLInputElement;
        if (input) input.focus();
    }, []);

    // mock data
    const liquidityText = '0.25 ETH';
    const networkFeeText = '≈$0.01';

    return (
        <section className={styles.create_token}>
            <div className={styles.create_token_top}>
                <BreadCrumb />
                <p>
                    SOME TEXT HERE DESCRIBING HOW LAUNCHING A TOKEN WORKS AND
                    WHAT THINGS WILL HAPPEN
                </p>
            </div>
            <div className={styles.create_token_middle}>
                <div className={styles.ticker_input_fields}>
                    <label htmlFor={TICKER_INPUT_ID}>
                        <h4>Token Ticker</h4>
                        <div>{TICKER_MAX_LENGTH - ticker.length}</div>
                    </label>
                    <input
                        name={TICKER_INPUT_ID}
                        id={TICKER_INPUT_ID}
                        type='text'
                        maxLength={TICKER_MAX_LENGTH}
                        onChange={(e) => handleChange(e.target.value)}
                        autoComplete='off'
                    />
                </div>
                <div className={styles.detail_box}>
                    <div>
                        <div>LIQUIDITY</div>
                        <div>{liquidityText}</div>
                    </div>
                    <div>
                        <div>NETWORK FEE</div>
                        <div>{networkFeeText}</div>
                    </div>
                </div>
            </div>
            <button
                className={
                    !isUserConnected || (!isValidationInProgress && isValidated)
                        ? styles.create_button
                        : styles.create_button_disabled
                }
                onClick={() =>
                    !isUserConnected
                        ? openWalletModal()
                        : console.log(`clicked Create Token for ${ticker}`)
                }
                disabled={
                    isUserConnected && (isValidationInProgress || !isValidated)
                }
            >
                {!isUserConnected
                    ? 'Connect Wallet'
                    : ticker === ''
                    ? 'Enter a Token Ticker'
                    : isValidationInProgress
                    ? 'Validating Ticker...'
                    : isValidated
                    ? 'Create Token'
                    : `Invalid Ticker: ${ticker}`}
            </button>
        </section>
    );
}
