import { useContext, useEffect, useState } from 'react';
import styles from './Create.module.css';
import useDebounce from '../../../App/hooks/useDebounce';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

export default function Create() {
    const [ticker, setTicker] = useState<string>('');
    const desktopScreen = useMediaQuery('(min-width: 1280px)');
    const [showDevElement, setShowDevElements] = useState(false);
    const [showDevElement2, setShowDevElements2] = useState(false);

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

    const liquidity = '0.25 ETH';

    const networkFee = 0.01;
    const extraInfoData = [
        {
            title: 'LIQUIDITY',
            tooltipTitle: 'liquidity',
            data: liquidity,
        },
        {
            title: 'NETWORK FEE',
            tooltipTitle: 'Estimated network fee (i.e. gas cost) to join bid',
            data: networkFee ? '~' + networkFee : '...',
        },
    ];

    const createHeader = (
        <div className={styles.create_token_top}>
            {!desktopScreen && <BreadCrumb />}
            <h3 onClick={() => setShowDevElements(!showDevElement)}>CREATE</h3>
            <p className={styles.description}>
                Some text here describing how launching a token works and what
                things will happen.
            </p>
        </div>
    );

    const extraInfoDisplay = (
        <div className={styles.extraInfoContainer}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extraRow} key={idx}>
                    <div className={styles.alignCenter}>
                        <p>{item.title}</p>
                        <TooltipComponent title={item.tooltipTitle} />
                    </div>
                    <p style={{ color: 'var(--text2)' }}>{item.data}</p>
                </div>
            ))}
        </div>
    );

    const tokenTicker = (
        <div className={styles.create_token_middle}>
            <div className={styles.ticker_input_fields}>
                <label htmlFor={TICKER_INPUT_ID}>
                    <h4 onClick={() => setShowDevElements2(!showDevElement2)}>
                        Token Ticker
                    </h4>
                </label>
                <input
                    name={TICKER_INPUT_ID}
                    id={TICKER_INPUT_ID}
                    type='text'
                    maxLength={TICKER_MAX_LENGTH}
                    onChange={(e) => handleChange(e.target.value)}
                    autoComplete='off'
                    value={TICKER_MAX_LENGTH - ticker.length}
                />
            </div>
        </div>
    );

    const footerDisplay = (
        <footer className={styles.footerContainer}>
            {extraInfoDisplay}
            <button
                className={
                    !isUserConnected || (!isValidationInProgress && isValidated)
                        ? styles.create_button
                        : styles.create_button_disabled
                }
                onClick={() =>
                    !isUserConnected
                        ? openWalletModal()
                        : console.log(`clicked Create Auction for ${ticker}`)
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
                    ? 'Create Auction'
                    : `Invalid Ticker: ${ticker}`}
            </button>
        </footer>
    );

    return (
        <section className={showDevElement ? styles.mainContainer : ''}>
            <div
                className={styles.create_token}
                style={{
                    border: showDevElement2
                        ? '1px solid rgba( 255, 255, 255, 0.1 )'
                        : '',
                }}
            >
                {createHeader}

                {tokenTicker}
                {footerDisplay}
            </div>
        </section>
    );
}
