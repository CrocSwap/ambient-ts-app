import styles from './RangeCard.module.css';
export default function RangeCard() {
    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const minMax = (
        <div className={styles.min_max}>
            <p>Min</p>
            <p>Max</p>
        </div>
    );

    const lardeDesktopMinMaxDisplay = (
        <div className={styles.min_max_range}>
            <p>Min: 1234.22</p>
            <p>Max: 232.212</p>
        </div>
    );

    const tokenQty = (
        <div className={styles.token_qty}>
            T1 Qty
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );

    return <div></div>;
}
