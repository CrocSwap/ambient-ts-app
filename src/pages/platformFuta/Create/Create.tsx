import { useContext, useEffect, useState } from 'react';
import styles from './Create.module.css';
import useDebounce from '../../../App/hooks/useDebounce';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import TooltipLabel from '../../../components/Futa/TooltipLabel/TooltipLabel';
import {
    checkTickerPattern,
    checkTickerValidity,
} from '../../../ambient-utils/dataLayer';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export default function Create() {
    const desktopScreen = useMediaQuery('(min-width: 1080px)');

    const { isUserConnected } = useContext(UserDataContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const { tickerInput, setTickerInput } = useContext(AuctionsContext);

    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);

    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [invalidReason, setInvalidReason] = useState<string | undefined>();

    function handleChange(text: string) {
        const sanitized = text.trim();
        if (checkTickerPattern(sanitized)) {
            setIsValidationInProgress(true);
            setTickerInput(sanitized.toUpperCase());
        }
    }

    const debouncedTickerInput = useDebounce(tickerInput, 500);

    useEffect(() => {
        checkTickerValidity(chainId, debouncedTickerInput).then((response) => {
            setIsValidationInProgress(false);
            setIsValidated(response.isValid);
            setInvalidReason(response.invalidReason);
        });
    }, [debouncedTickerInput, chainId]);

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
                          : `${invalidReason}: ${tickerInput}`}
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
