import styles from './CurrencyDisplay.module.css';

// we will eventually get the data passed down as props through token data.
// For now, token data is hardcoded
interface CurrencyDisplayProps {
    // eslint-disable-next-line
    tokenData: any;
    amount: number;
}

export default function CurrencyDisplay(props: CurrencyDisplayProps) {
    const { amount, tokenData } = props;

    const currencyBox = (
        <div className={styles.modalSwapbox}>
            <div className={styles.swapbox_top}>
                <div className={styles.token_select}>
                    <img
                        src={tokenData.logoLocal}
                        width='25px'
                        className={styles.token_list_img}
                        alt={tokenData.logoAltText}
                    />
                    <span className={styles.token_list_text}>{tokenData.symbol}</span>
                </div>
                <div className={styles.token_amount}>
                    <span className={styles.currency_quantity}>{amount}</span>
                </div>
            </div>
        </div>
    );
    return <div>{currencyBox}</div>;
}
