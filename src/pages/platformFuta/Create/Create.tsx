import { useEffect, useState } from 'react';
import styles from './Create.module.css';
import { Link } from 'react-router-dom';

export default function Create() {
    const [ticker, setTicker] = useState<string>('');

    const [isValidated, setIsValidated] = useState<boolean>(false);

    function handleChange(text: string) {
        setIsValidated(false);
        setTicker(text);
    }

    useEffect(() => {
        if (isValidated) return;
        const interval = setInterval(() => setIsValidated(true), 500);
        return () => clearInterval(interval);
    }, [isValidated]);

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
                <div className={styles.nav_path}>
                    <Link to={'/'}>Home</Link>
                    {' > Create'}
                </div>
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
                    isValidated && ticker !== ''
                        ? styles.create_button
                        : styles.create_button_disabled
                }
                onClick={() => console.log('clicked Create Token')}
                disabled={!isValidated || ticker === ''}
            >
                {ticker === ''
                    ? 'Enter a Name'
                    : isValidated
                      ? 'Create Token'
                      : 'Validating Ticker...'}
            </button>
        </section>
    );
}
