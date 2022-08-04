import styles from './AccountTokensDisplay.module.css';

export default function AccountTokensDisplay() {
    const baseToken = (
        <img
            src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
            alt=''
        />
    );

    const quoteToken = (
        <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
    );

    return (
        <section className={styles.token_display_container}>
            {baseToken}
            {quoteToken}
        </section>
    );
}
