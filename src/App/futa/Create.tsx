import styles from './Create.module.css';

export default function Create() {
    // name for the ticker input field, keeps `<input/>` and `<label/>` sync'd
    const tickerInputName = 'ticker_input';

    return (
        <section className={styles.create_token}>
            <div>{'Home > Create'}</div>
            <p>
                SOME TEXT HERE DESCRIBING HOW LAUNCHING A TOKEN WORKS AND WHAT
                THINGS WILL HAPPEN
            </p>
            <label htmlFor={tickerInputName}>
                <h4>Token Ticker</h4>
            </label>
            <input name={tickerInputName} type='text' />
            <div>
                <div>
                    <div>LIQUIDITY</div>
                    <div>0.25 ETH</div>
                </div>
                <div>
                    <div>NETWORK FEE</div>
                    <div>≈$0.01</div>
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
