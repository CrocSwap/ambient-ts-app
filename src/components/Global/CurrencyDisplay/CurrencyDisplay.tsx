import styles from './CurrencyDisplay.module.css';

// we will eventually get the data passed down as props through token data.
// For now, token data is hardcoded
interface CurrencyDisplayProps {
    // eslint-disable-next-line
    tokenData: any;
    amount: string;
    isLimitBox?: boolean;
}

export default function CurrencyDisplay(props: CurrencyDisplayProps) {
    const { amount, tokenData, isLimitBox } = props;

    const limitBox = (
        <div className={styles.limit_modalSwapbox}>
            <div className={styles.swapbox_top}>
                <div className={styles.limit_token_select}>1 ETH =</div>
                <div className={styles.token_amount}>
                    <div className={styles.currency_quantity}>
                        {amount}
                        <span className={styles.text_grey}> DAI</span>
                    </div>
                </div>
            </div>
        </div>
    );

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
    return <div>{isLimitBox ? limitBox : currencyBox}</div>;
}
