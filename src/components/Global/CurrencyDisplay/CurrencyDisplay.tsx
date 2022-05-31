import styles from './CurrencyDisplay.module.css';

// we will eventually get the data passed down as props through token data.
// For now, token data is hardcoded
interface CurrencyDisplayProps {
    // tokenData: React.ReactNode;
    amount: number;
    logoLocal: string;
    logoAltText: string;
    symbol: string;
}

export default function CurrencyDisplay(props: CurrencyDisplayProps) {
    const { amount, logoAltText, logoLocal, symbol } = props;

    const currencyBox = (
        <div className={styles.modalSwapbox}>
            <div className={styles.swapbox_top}>
                <div className={styles.token_select}>
                    <img
                        src={logoLocal}
                        width='25px'
                        className={styles.token_list_img}
                        alt={logoAltText}
                    />
                    <span className={styles.token_list_text}>{symbol}</span>
                </div>
                <div className={styles.token_amount}>
                    <span className={styles.currency_quantity}>{amount}</span>
                </div>
            </div>
        </div>
    );
    return <div className={styles.CurrencyDisplau}>{currencyBox}</div>;
}
