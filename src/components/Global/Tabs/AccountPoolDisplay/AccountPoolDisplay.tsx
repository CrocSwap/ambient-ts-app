import styles from './AccountPoolDisplay.module.css';

interface AccountPoolDisplayPropsIF {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
}
export default function AccountPoolDisplay(props: AccountPoolDisplayPropsIF) {
    const { baseTokenSymbol, quoteTokenSymbol } = props;
    return (
        <section className={styles.account_pool_display}>
            {baseTokenSymbol}/{quoteTokenSymbol}
        </section>
    );
}
