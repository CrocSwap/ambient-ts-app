import { useContext, useEffect, useState } from 'react';
import styles from './Create.module.css';
import useDebounce from '../../../App/hooks/useDebounce';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import TooltipLabel from '../../../components/Futa/TooltipLabel/TooltipLabel';

export default function Create() {
    const desktopScreen = useMediaQuery('(min-width: 1080px)');

    const { isUserConnected } = useContext(UserDataContext);

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const { tickerInput, setTickerInput } = useContext(AuctionsContext);

    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);

    const [isValidated, setIsValidated] = useState<boolean>(false);

    const excludedTickers = [
        'ambi',
        'amb',
        'futa',
        'nft',
        'eth',
        'btc',
        'usdc',
        'usdt',
        'dai',
        'weth',
    ];

    // Regular expression pattern for Latin alphabet characters (both uppercase and lowercase), digits, and emoji
    const validTickerPattern = /^[A-Za-z0-9\p{Extended_Pictographic}]+$/u;
    /* 
        Example usage of the pattern
        console.log(isValidString("Hello123")); // true (Latin alphanumeric)
        console.log(isValidString("Hello😊123")); // true (Latin alphanumeric + Extended Pictographic)
        console.log(isValidString("こんにちは")); // false (Non-Latin characters)
        console.log(isValidString("1234😊😊")); // true (Digits + Extended Pictographic)
        console.log(isValidString("Hello!")); // false (Special character '!')
    */

    const checkTickerPattern = (ticker: string) => {
        if (ticker.length === 0) return true;
        return validTickerPattern.test(ticker);
    };

    const checkTickerValidity = async (ticker: string) => {
        // check if the ticker is in the excluded list
        const isExcluded = excludedTickers.includes(ticker.toLowerCase());
        const lengthIsValid = ticker.length > 0 && ticker.length <= 10;
        const tickerPatternValid = checkTickerPattern(ticker);
        return !isExcluded && tickerPatternValid && lengthIsValid;
    };

    function handleChange(text: string) {
        const sanitized = text.trim();
        if (checkTickerPattern(sanitized)) {
            setIsValidationInProgress(true);
            setTickerInput(sanitized.toUpperCase());
        }
    }

    const debouncedTickerInput = useDebounce(tickerInput, 500);

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
            tooltipTitle: 'NETWORK FEE PAID IN ORDER TO TRANSACT',
            data: networkFee ? '~' + networkFee : '...',
        },
    ];

    const createHeader = (
        <div className={styles.create_token_top}>
            {!desktopScreen && <BreadCrumb />}
            <h3>CREATE</h3>
            <p className={styles.description}>
                Some text here describing how launching a token works and what
                things will happen.
            </p>
        </div>
    );

    const extraInfoDisplay = (
        <div className={styles.extraInfoContainer}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.justifyRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.title}
                        tooltipTitle={item.tooltipTitle}
                    />
                    <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
                        {item.data}
                    </p>
                </div>
            ))}
        </div>
    );

    const tokenTicker = (
        <div className={styles.create_token_middle}>
            <div className={styles.ticker_input_fields}>
                <label htmlFor={TICKER_INPUT_ID}>
                    <h4>Token Ticker</h4>
                </label>
                <div className={styles.inputContainer}>
                    <input
                        name={TICKER_INPUT_ID}
                        id={TICKER_INPUT_ID}
                        value={tickerInput}
                        type='text'
                        maxLength={TICKER_MAX_LENGTH}
                        onChange={(e) => handleChange(e.target.value)}
                        autoCorrect='off'
                        spellCheck='false'
                        autoComplete='off'
                    />
                    <p>{TICKER_MAX_LENGTH - tickerInput.length}</p>
                </div>
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
                        : console.log(
                              `clicked Create Auction for ${tickerInput}`,
                          )
                }
                disabled={
                    isUserConnected && (isValidationInProgress || !isValidated)
                }
            >
                {!isUserConnected
                    ? 'Connect Wallet'
                    : tickerInput === ''
                      ? 'Enter a Token Ticker'
                      : isValidationInProgress
                        ? 'Validating Ticker...'
                        : isValidated
                          ? 'Create Auction'
                          : `Invalid Ticker: ${tickerInput}`}
            </button>
        </footer>
    );

    return (
        <section className={styles.mainContainer}>
            <div className={styles.create_token}>
                {createHeader}

                {tokenTicker}
                {footerDisplay}
            </div>
        </section>
    );
}
