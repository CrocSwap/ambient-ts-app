import TableMenu from '../TableMenu/TableMenu';
import styles from './TransactionCard2.module.css';

export default function TransactionCard2() {
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
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}
                <section className={styles.column_account}>
                    <p>0xcD...1234</p>
                    <p>0xCd...9876</p>
                </section>
                <section className={styles.account_sing}>0xcD...1234</section>
                <section className={styles.account_sing}>0xCd...9876</section>

                {/* ------------------------------------------------------ */}
            </div>

            <div className={styles.menu_container}>
                <TableMenu tableType='transactions' />
            </div>
        </div>
    );
}
