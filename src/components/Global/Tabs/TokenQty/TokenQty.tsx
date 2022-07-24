import styles from './TokenQty.module.css';

export default function TokenQty() {
    const token1 = (
        <section className={styles.qty_sing}>
            <p>T1 Qty</p>
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </section>
    );

    const token2 = (
        <section className={styles.qty_sing}>
            <p>T2 Qty</p>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </section>
    );

    const tokenQtyColumns = (
        <section className={styles.column_qty}>
            <div>
                <p>T1 Qty</p>
                <img
                    src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                    alt=''
                />
            </div>
            <div>
                <p>T2 Qty</p>
                <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            </div>
        </section>
    );
    return (
        <>
            {tokenQtyColumns}
            {token1}
            {token2}
        </>
    );
}
