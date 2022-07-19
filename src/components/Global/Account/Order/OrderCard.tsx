import styles from './OrderCard.module.css';
export default function OrderCard() {
    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const tokenQty = (
        <div className={styles.token_qty}>
            T1 Qty
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );
    return <div>OrderCard</div>;
}
