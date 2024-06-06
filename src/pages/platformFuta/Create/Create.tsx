import { useState } from 'react';
import styles from './Create.module.css';

export default function Create() {
    const [ticker, setTicker] = useState<string>('');

    // name for the ticker input field, keeps `<input/>` and `<label/>` sync'd
    const TICKER_INPUT_ID = 'ticker_input';
    const TICKER_MAX_LENGTH = 10;

    return (
        <section className={styles.create_token}>
            <div className={styles.create_token_top}>
                <div className={styles.nav_path}>{'Home > Create'}</div>
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
                        type='text'
                        maxLength={TICKER_MAX_LENGTH}
                        onChange={(e) => setTicker(e.target.value)}
                    />
                </div>
                <div className={styles.detail_box}>
                    <div>
                        <div>LIQUIDITY</div>
                        <div>0.25 ETH</div>
                    </div>
                    <div>
                        <div>NETWORK FEE</div>
                        <div>≈$0.01</div>
                    </div>
                </div>
            </div>
            <button
                className={styles.create_button}
                onClick={() => console.log('clicked Create Token')}
            >
                Create Token
            </button>
        </section>
    );
}
