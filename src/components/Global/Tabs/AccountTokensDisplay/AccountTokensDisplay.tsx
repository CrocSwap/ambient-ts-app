import styles from './AccountTokensDisplay.module.css';

interface AccountTokensPropsIF {
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
}

export default function AccountTokensDisplay(props: AccountTokensPropsIF) {
    const { baseTokenLogoURI, quoteTokenLogoURI } = props;
    const baseToken = <img src={baseTokenLogoURI} alt='' />;

    const quoteToken = <img src={quoteTokenLogoURI} alt='' />;

    return (
        <section className={styles.token_display_container}>
            {baseToken}
            {quoteToken}
        </section>
    );
}
