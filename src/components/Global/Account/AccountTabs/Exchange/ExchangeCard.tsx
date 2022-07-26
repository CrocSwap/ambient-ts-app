import styles from './ExchangeCard.module.css';

export default function ExchangeCard() {
    const tokenInfo = (
        <div className={styles.token_info}>
            <div className={styles.token_icon}>
                <img
                    src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                    alt=''
                    width='30px'
                />
                <p className={styles.token_key}>ETH</p>
            </div>
            <p>Ethereum</p>
        </div>
    );
    return (
        <div className={styles.exchange_row}>
            {tokenInfo}
            <p className={styles.value}>$1,000,000.00</p>
            <p className={styles.amount}>100.00</p>
        </div>
    );
}
